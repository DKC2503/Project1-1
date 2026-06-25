const mongoose = require('mongoose');
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');
const { Resolver } = dns;

let isConnected = false;
const connections = {}; // maps clusterId -> Connection
const schemas = {};
const models = {};
const configPath = path.join(__dirname, 'database_config.json');

const mongooseOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
};

const loadConfig = () => {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        // Ignore errors
    }
    return [
        {
            clusterId: 'default',
            clusterName: 'Primary MongoDB',
            databaseName: '',
            host: '',
            status: 'Connected',
            createdAt: new Date().toISOString(),
            isActive: true
        }
    ];
};

const saveConfig = (config) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to save database config:', e);
    }
};

const maskUri = (uri) => {
    if (!uri) return '';
    try {
        const doubleSlashIndex = uri.indexOf('://');
        const atIndex = uri.lastIndexOf('@');
        if (doubleSlashIndex !== -1 && atIndex !== -1) {
            const authPart = uri.substring(doubleSlashIndex + 2, atIndex);
            const user = authPart.split(':')[0];
            return uri.substring(0, doubleSlashIndex + 2) + "*****:*****" + uri.substring(atIndex);
        }
        return uri.replace(/:([^:]+)@/, ':*****@');
    } catch (e) {
        return 'mongodb://*****';
    }
};

const checkDNS = async (uri) => {
    if (uri && uri.startsWith('mongodb+srv://')) {
        try {
            const hostWithQuery = uri.split('mongodb+srv://')[1];
            const host = hostWithQuery.split('/')[0].split('?')[0];
            const usernameHost = host.includes('@') ? host.split('@')[1] : host;
            
            await dns.resolveSrv(`_mongodb._tcp.${usernameHost}`);
            return true;
        } catch (err) {
            return false;
        }
    }
    return true;
};

const resolveSrvPublic = async (host) => {
    try {
        const resolver = new Resolver();
        resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        const records = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
        return records;
    } catch (err) {
        return null;
    }
};

const rewriteSrvUri = async (uri) => {
    if (!uri || !uri.startsWith('mongodb+srv://')) {
        return uri;
    }
    try {
        const doubleSlashIndex = uri.indexOf('://');
        const atIndex = uri.lastIndexOf('@');
        const authPart = atIndex !== -1 ? uri.substring(doubleSlashIndex + 3, atIndex) : '';
        const rest = uri.substring(atIndex !== -1 ? atIndex + 1 : doubleSlashIndex + 3);
        const slashIndex = rest.indexOf('/');
        const host = slashIndex !== -1 ? rest.substring(0, slashIndex) : rest;
        const pathAndQuery = slashIndex !== -1 ? rest.substring(slashIndex) : '/';

        const records = await resolveSrvPublic(host);
        if (!records || records.length === 0) {
            return null;
        }

        const resolvedHosts = records.map(rec => `${rec.name}:${rec.port}`).join(',');
        let newUri = `mongodb://${authPart ? authPart + '@' : ''}${resolvedHosts}${pathAndQuery}`;
        
        if (!newUri.includes('ssl=') && !newUri.includes('tls=')) {
            newUri += (newUri.includes('?') ? '&' : '?') + 'tls=true';
        }
        if (!newUri.includes('authSource=')) {
            newUri += (newUri.includes('?') ? '&' : '?') + 'authSource=admin';
        }
        return newUri;
    } catch (err) {
        return null;
    }
};

const getClusterNameFromUri = (uri) => {
    try {
        const doubleSlashIndex = uri.indexOf('://');
        const atIndex = uri.lastIndexOf('@');
        const rest = uri.substring(atIndex !== -1 ? atIndex + 1 : doubleSlashIndex + 3);
        const host = rest.split('/')[0].split('?')[0];
        if (host.includes('.')) {
            const parts = host.split('.');
            if (parts[0].startsWith('ac-')) {
                return parts[0];
            }
            return parts[0];
        }
        return host || 'Secondary Cluster';
    } catch (e) {
        return 'Secondary Cluster';
    }
};

const parseUriPassword = (uri) => {
    if (!uri) return null;
    try {
        const doubleSlashIndex = uri.indexOf('://');
        if (doubleSlashIndex === -1) return null;
        const afterProto = uri.substring(doubleSlashIndex + 3);
        const atIndex = afterProto.lastIndexOf('@');
        if (atIndex === -1) return null; // No credentials
        const credentials = afterProto.substring(0, atIndex);
        const colonIndex = credentials.indexOf(':');
        if (colonIndex === -1) return null; // No password
        return credentials.substring(colonIndex + 1);
    } catch (e) {
        return null;
    }
};

const hasUnescapedSpecialChars = (password) => {
    if (!password) return false;
    // Special characters that must be percent-encoded in URI password: @, :, /, ?, #, [, ], +, &
    const specialChars = /[@:\/\?#\[\]\+&]/;
    if (specialChars.test(password)) {
        return true;
    }
    // Check for raw percent symbol '%' not followed by two valid hex digits
    const percentCheck = /%[^0-9a-fA-F]|%[0-9a-fA-F][^0-9a-fA-F]|%$/;
    if (percentCheck.test(password)) {
        return true;
    }
    return false;
};

const categorizeError = (err, uri) => {
    const msg = err.message || '';
    const code = err.code || '';

    // Check password encoding first
    if (uri) {
        const password = parseUriPassword(uri);
        if (password && hasUnescapedSpecialChars(password)) {
            return '❌ Password contains unescaped special characters.';
        }
    }

    if (msg.includes('Must start with "mongodb') || msg.includes('URI format is invalid') || msg.includes('Invalid MongoDB URI')) {
        return '❌ Invalid MongoDB URI.';
    }

    if (
        code === 'ENOTFOUND' || 
        code === 'EREFUSED' || 
        msg.includes('querySrv') || 
        (msg.includes('ECONNREFUSED') && msg.includes('querySrv')) ||
        msg.includes('dns lookup failed')
    ) {
        return '❌ DNS lookup failed.';
    }

    if (msg.includes('Authentication failed') || msg.includes('auth failed') || code === 8000) {
        return '❌ Atlas authentication failed.';
    }

    // TLS Handshake failures
    if (
        msg.includes('TLSV1_ALERT_INTERNAL_ERROR') || 
        msg.includes('ssl handshake') || 
        msg.includes('handshake failure') || 
        msg.includes('SSL') || 
        msg.includes('TLS') ||
        code.toString().includes('SSL') ||
        code.toString().includes('ERR_SSL') ||
        msg.includes('CERT_') ||
        msg.includes('unable to verify the first certificate')
    ) {
        return '❌ TLS handshake failed.';
    }

    // Network whitelist block
    if (
        msg.includes('not allowed to connect') || 
        msg.includes('whitelist') || 
        msg.includes('IP address') || 
        msg.includes('selection timeout') || 
        code === 'ETIMEDOUT'
    ) {
        return '❌ MongoDB Atlas Network Access is blocking this server.';
    }

    // User permissions
    if (msg.includes('not authorized') || msg.includes('unauthorized') || msg.includes('requires auth')) {
        return '❌ User does not have sufficient read/write permissions on Atlas.';
    }

    return `❌ Connection Failed: ${msg}`;
};

const getOnlineConnections = () => {
    const list = [];
    for (const clusterId of Object.keys(connections)) {
        const conn = connections[clusterId];
        if (conn && conn.readyState === 1) {
            list.push({ clusterId, conn });
        }
    }
    return list;
};

const getActiveWriteConnection = () => {
    const config = loadConfig();
    const activeCluster = config.find(c => c.isActive);
    const activeId = activeCluster ? activeCluster.clusterId : 'default';
    const conn = connections[activeId];
    if (conn && conn.readyState === 1) {
        return conn;
    }
    return connections['default'];
};

const findConnectionForQuery = async (modelName, query) => {
    const conns = getOnlineConnections();
    const results = await Promise.all(conns.map(async ({ clusterId, conn }) => {
        try {
            const doc = await conn.model(modelName).findOne(query).select('_id').lean();
            if (doc) return clusterId;
        } catch (e) {
            // Ignore
        }
        return null;
    }));
    const foundId = results.find(id => id !== null);
    return foundId || 'default';
};

const sortMergedArray = (arr, sortArg) => {
    let sortFields = [];
    if (typeof sortArg === 'string') {
        const parts = sortArg.trim().split(/\s+/);
        for (const p of parts) {
            if (p.startsWith('-')) {
                sortFields.push({ field: p.substring(1), order: -1 });
            } else {
                sortFields.push({ field: p, order: 1 });
            }
        }
    } else if (sortArg && typeof sortArg === 'object') {
        for (const k of Object.keys(sortArg)) {
            const val = sortArg[k];
            const order = (val === -1 || val === 'desc' || val === 'descending') ? -1 : 1;
            sortFields.push({ field: k, order });
        }
    }

    if (sortFields.length === 0) return arr;

    return arr.sort((a, b) => {
        for (const sf of sortFields) {
            const valA = a.get ? a.get(sf.field) : a[sf.field];
            const valB = b.get ? b.get(sf.field) : b[sf.field];

            if (valA === undefined || valA === null) {
                if (valB !== undefined && valB !== null) return 1;
            } else if (valB === undefined || valB === null) {
                return -1;
            } else if (valA < valB) {
                return -1 * sf.order;
            } else if (valA > valB) {
                return 1 * sf.order;
            }
        }
        return 0;
    });
};

class MultiClusterQuery {
    constructor(modelName, op, queryArgs) {
        this.modelName = modelName;
        this.op = op;
        this.queryArgs = queryArgs;
        this.modifiers = [];
    }

    sort(...args) { this.modifiers.push({ method: 'sort', args }); return this; }
    limit(...args) { this.modifiers.push({ method: 'limit', args }); return this; }
    skip(...args) { this.modifiers.push({ method: 'skip', args }); return this; }
    populate(...args) { this.modifiers.push({ method: 'populate', args }); return this; }
    select(...args) { this.modifiers.push({ method: 'select', args }); return this; }
    lean(...args) { this.modifiers.push({ method: 'lean', args }); return this; }

    async exec() {
        const conns = getOnlineConnections();
        
        const promises = conns.map(async ({ conn }) => {
            try {
                const Model = conn.model(this.modelName);
                let query = Model[this.op](...this.queryArgs);
                
                for (const mod of this.modifiers) {
                    if (mod.method === 'populate' || mod.method === 'select' || mod.method === 'lean' || mod.method === 'sort') {
                        query = query[mod.method](...mod.args);
                    }
                }
                return await query;
            } catch (err) {
                return null;
            }
        });

        const allResults = await Promise.all(promises);

        if (this.op === 'findOne' || this.op === 'findById') {
            return allResults.find(r => r !== null && r !== undefined) || null;
        }

        if (this.op === 'countDocuments' || this.op === 'estimatedDocumentCount') {
            return allResults.reduce((sum, count) => sum + (count || 0), 0);
        }

        if (this.op === 'aggregate') {
            let merged = [];
            for (const res of allResults) {
                if (Array.isArray(res)) {
                    merged = merged.concat(res);
                }
            }
            return merged;
        }

        // Operation 'find'
        let merged = [];
        for (const res of allResults) {
            if (Array.isArray(res)) {
                merged = merged.concat(res);
            }
        }

        // Apply sort
        const sortMod = this.modifiers.find(m => m.method === 'sort');
        if (sortMod && sortMod.args.length > 0) {
            merged = sortMergedArray(merged, sortMod.args[0]);
        }

        // Apply skip
        const skipMod = this.modifiers.find(m => m.method === 'skip');
        if (skipMod && skipMod.args.length > 0) {
            const skipVal = parseInt(skipMod.args[0]) || 0;
            merged = merged.slice(skipVal);
        }

        // Apply limit
        const limitMod = this.modifiers.find(m => m.method === 'limit');
        if (limitMod && limitMod.args.length > 0) {
            const limitVal = parseInt(limitMod.args[0]);
            if (!isNaN(limitVal)) {
                merged = merged.slice(0, limitVal);
            }
        }

        return merged;
    }

    then(onResolve, onReject) {
        return this.exec().then(onResolve, onReject);
    }

    catch(onReject) {
        return this.exec().catch(onReject);
    }
}

const staticOverrides = {
    find: (modelName, ...args) => new MultiClusterQuery(modelName, 'find', args),
    findOne: (modelName, ...args) => new MultiClusterQuery(modelName, 'findOne', args),
    findById: (modelName, ...args) => new MultiClusterQuery(modelName, 'findOne', [{ _id: args[0] }]),
    countDocuments: (modelName, ...args) => new MultiClusterQuery(modelName, 'countDocuments', args),
    estimatedDocumentCount: (modelName, ...args) => new MultiClusterQuery(modelName, 'estimatedDocumentCount', args),
    aggregate: (modelName, ...args) => new MultiClusterQuery(modelName, 'aggregate', args),
    
    create: async (modelName, ...args) => {
        const ActiveModel = getActiveWriteConnection().model(modelName);
        return ActiveModel.create(...args);
    },
    
    insertMany: async (modelName, ...args) => {
        const ActiveModel = getActiveWriteConnection().model(modelName);
        return ActiveModel.insertMany(...args);
    },
    
    updateOne: async (modelName, query, update, options) => {
        const clusterId = await findConnectionForQuery(modelName, query);
        const Model = connections[clusterId].model(modelName);
        return Model.updateOne(query, update, options);
    },
    
    updateMany: async (modelName, query, update, options) => {
        const conns = getOnlineConnections();
        const results = await Promise.all(conns.map(async ({ conn }) => {
            try {
                return await conn.model(modelName).updateMany(query, update, options);
            } catch (e) {
                return null;
            }
        }));
        return results.find(r => r !== null);
    },
    
    deleteOne: async (modelName, query, options) => {
        const clusterId = await findConnectionForQuery(modelName, query);
        const Model = connections[clusterId].model(modelName);
        return Model.deleteOne(query, options);
    },
    
    deleteMany: async (modelName, query, options) => {
        const conns = getOnlineConnections();
        const results = await Promise.all(conns.map(async ({ conn }) => {
            try {
                return await conn.model(modelName).deleteMany(query, options);
            } catch (e) {
                return null;
            }
        }));
        return results.find(r => r !== null);
    },
    
    findOneAndUpdate: async (modelName, query, update, options) => {
        const clusterId = await findConnectionForQuery(modelName, query);
        const Model = connections[clusterId].model(modelName);
        return Model.findOneAndUpdate(query, update, options);
    },
    
    findOneAndDelete: async (modelName, query, options) => {
        const clusterId = await findConnectionForQuery(modelName, query);
        const Model = connections[clusterId].model(modelName);
        return Model.findOneAndDelete(query, options);
    },
    
    findByIdAndUpdate: async (modelName, id, update, options) => {
        const query = { _id: id };
        const clusterId = await findConnectionForQuery(modelName, query);
        const Model = connections[clusterId].model(modelName);
        return Model.findByIdAndUpdate(id, update, options);
    },
    
    findByIdAndDelete: async (modelName, id, options) => {
        const query = { _id: id };
        const clusterId = await findConnectionForQuery(modelName, query);
        const Model = connections[clusterId].model(modelName);
        return Model.findByIdAndDelete(id, options);
    },
    
    exists: async (modelName, query) => {
        const conns = getOnlineConnections();
        const results = await Promise.all(conns.map(async ({ conn }) => {
            try {
                return await conn.model(modelName).exists(query);
            } catch (e) {
                return null;
            }
        }));
        return results.some(r => r);
    },
    
    populate: (modelName, ...args) => {
        const ActiveModel = getActiveWriteConnection().model(modelName);
        return ActiveModel.populate(...args);
    }
};

const makeMultiClusterModel = (modelName, schema) => {
    schemas[modelName] = schema;

    // Call original mongoose.model on default connection
    const defaultModel = originalModel(modelName, schema);

    // Compile schema on other active connections
    for (const clusterId of Object.keys(connections)) {
        if (clusterId !== 'default') {
            try {
                connections[clusterId].model(modelName, schema);
            } catch (e) {}
        }
    }

    const ModelProxy = new Proxy(class {}, {
        construct(target, args) {
            const ActiveModel = getActiveWriteConnection().model(modelName);
            return Reflect.construct(ActiveModel, args);
        },
        get(target, prop, receiver) {
            if (staticOverrides[prop]) {
                return (...args) => staticOverrides[prop](modelName, ...args);
            }
            const ActiveModel = getActiveWriteConnection().model(modelName);
            const value = Reflect.get(ActiveModel, prop);
            if (typeof value === 'function') {
                return value.bind(ActiveModel);
            }
            return value;
        }
    });

    models[modelName] = ModelProxy;
    return ModelProxy;
};

const originalModel = mongoose.model.bind(mongoose);
mongoose.model = (name, schema) => {
    if (!schema) {
        return models[name] || originalModel(name);
    }
    return makeMultiClusterModel(name, schema);
};

// Also proxy mongoose.models object
mongoose.models = new Proxy(mongoose.models, {
    get(target, prop) {
        if (models[prop]) {
            return models[prop];
        }
        return Reflect.get(target, prop);
    }
});

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    const primaryUri = process.env.MONGODB_URI;
    if (!primaryUri) {
        console.error('[DB] Connection Failed\nReason: ❌ Invalid MongoDB URI (missing MONGODB_URI in env)');
        throw new Error('Database connection failed: MONGODB_URI is undefined.');
    }

    console.log('[DB] Connecting to Primary MongoDB');

    let connectionUri = primaryUri;
    let srvResolvedSuccessfully = true;

    try {
        if (primaryUri.startsWith('mongodb+srv://')) {
            const dnsOk = await checkDNS(primaryUri);
            if (!dnsOk) {
                srvResolvedSuccessfully = false;
            }
        }
    } catch (err) {
        srvResolvedSuccessfully = false;
    }

    if (!srvResolvedSuccessfully) {
        console.log('[DB] Local DNS resolution failed for SRV record. Attempting fallback via public DNS servers...');
        const rewritten = await rewriteSrvUri(primaryUri);
        if (rewritten) {
            connectionUri = rewritten;
            console.log('[DB] Successfully resolved primary cluster via public DNS.');
        } else {
            console.error('[DB] Connection Failed');
            console.error('Reason:\n❌ DNS Resolution Failed');
            throw new Error('Database connection failed: ❌ DNS Resolution Failed');
        }
    }

    try {
        await mongoose.connect(connectionUri, mongooseOptions);
        
        if (mongoose.connection.readyState === 1) {
            isConnected = true;
            connections['default'] = mongoose.connection;
            console.log('[DB] Connection Successful');
            console.log(`Database:\n${mongoose.connection.name}`);
            console.log(`Host:\n${mongoose.connection.host}`);
            
        }
    } catch (err) {
        if (connectionUri === primaryUri && primaryUri.startsWith('mongodb+srv://') && 
            (err.code === 'ENOTFOUND' || err.code === 'EREFUSED' || err.message.includes('querySrv') || err.message.includes('ECONNREFUSED'))) {
            console.log('[DB] Connection failed with DNS error. Attempting fallback via public DNS servers...');
            const rewritten = await rewriteSrvUri(primaryUri);
            if (rewritten) {
                try {
                    await mongoose.connect(rewritten, mongooseOptions);
                    if (mongoose.connection.readyState === 1) {
                        isConnected = true;
                        connections['default'] = mongoose.connection;
                        console.log('[DB] Connection Successful');
                        console.log(`Database:\n${mongoose.connection.name}`);
                        console.log(`Host:\n${mongoose.connection.host}`);
                        return;
                    }
                } catch (retryErr) {
                    const errorReason = categorizeError(retryErr, primaryUri);
                    console.error('[DB] Connection Failed');
                    console.error(`Reason:\n${errorReason}`);
                    throw new Error(`Database connection failed: ${errorReason}`);
                }
            }
        }

        const errorReason = categorizeError(err, primaryUri);
        console.error('[DB] Connection Failed');
        console.error(`Reason:\n${errorReason}`);
        throw new Error(`Database connection failed: ${errorReason}`);
    }

    // Connect to other secondary registered clusters
    const config = loadConfig();
    for (const entry of config) {
        if (entry.clusterId !== 'default' && entry.uri) {
            console.log(`[DB] Connecting to Standby Cluster: ${entry.clusterName}`);
            let secondaryUri = entry.uri;
            if (secondaryUri.startsWith('mongodb+srv://')) {
                const rewritten = await rewriteSrvUri(secondaryUri);
                if (rewritten) {
                    secondaryUri = rewritten;
                }
            }

            const conn = mongoose.createConnection(secondaryUri, mongooseOptions);
            connections[entry.clusterId] = conn;

            conn.on('connected', () => {
                console.log(`[DB] Connected to cluster: ${entry.clusterName}`);
                
                for (const modelName of Object.keys(schemas)) {
                    try {
                        conn.model(modelName, schemas[modelName]);
                    } catch (e) {}
                }
            });

            conn.on('error', (err) => {
                console.error(`[DB] Error connecting to cluster: ${entry.clusterName}`, err.message);
            });
        }
    }
};

const getHealthStatus = () => {
    return {
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState
    };
};

const getRegisteredClustersList = async () => {
    const config = loadConfig();
    const list = [];
    
    for (const entry of config) {
        const conn = connections[entry.clusterId];
        const isOnline = conn && conn.readyState === 1;
        
        let docCount = 0;
        let liveHost = entry.host;
        let liveDb = entry.databaseName;
        
        if (isOnline) {
            try {
                const rawStats = await conn.db.command({ dbStats: 1 });
                docCount = rawStats.objects || 0;
                liveHost = conn.host;
                liveDb = conn.name;
            } catch (e) {
                // Ignore stats errors
            }
        }
        
        list.push({
            clusterId: entry.clusterId,
            clusterName: entry.clusterName || getClusterNameFromUri(entry.uri || ''),
            databaseName: liveDb || 'test',
            host: liveHost || 'localhost',
            status: isOnline ? 'Connected' : 'Disconnected',
            createdAt: entry.createdAt,
            isActive: entry.isActive,
            documentCount: docCount,
            notes: entry.notes || '',
            maskedUri: maskUri(entry.uri || process.env.MONGODB_URI || '')
        });
    }
    return list;
};

const getActiveClusterInfo = async () => {
    const list = await getRegisteredClustersList();
    const active = list.find(c => c.isActive) || list[0];
    return active;
};

const testClusterConnection = async (uri) => {
    // 1. Validate URI format first
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
        throw new Error('❌ Invalid MongoDB URI.');
    }

    // 2. Check for unescaped special characters in password before connecting
    const password = parseUriPassword(uri);
    if (password && hasUnescapedSpecialChars(password)) {
        throw new Error('❌ Password contains unescaped special characters.');
    }
    
    let connectionUri = uri;
    if (uri.startsWith('mongodb+srv://')) {
        const rewritten = await rewriteSrvUri(uri);
        if (rewritten) {
            connectionUri = rewritten;
        }
    }

    const tempConn = mongoose.createConnection(connectionUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });

    try {
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
            tempConn.once('open', () => {
                clearTimeout(timeout);
                resolve();
            });
            tempConn.once('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        await tempConn.db.command({ listCollections: 1 });

        const testColl = tempConn.db.collection('__test_access__');
        await testColl.insertOne({ test: 1 });
        await testColl.deleteOne({ test: 1 });

        const info = {
            databaseName: tempConn.name,
            hostName: tempConn.host
        };

        await tempConn.close();
        return { success: true, ...info };
    } catch (err) {
        await tempConn.close().catch(() => {});
        const reason = categorizeError(err, uri);
        throw new Error(reason);
    }
};

const registerNewCluster = async (uri, notes) => {
    if (!uri) {
        throw new Error('❌ Invalid MongoDB URI');
    }

    console.log('[DB] Validating new cluster connection...');
    const connInfo = await testClusterConnection(uri);

    const clusterId = `cluster_${Date.now()}`;
    const newCluster = {
        clusterId,
        clusterName: getClusterNameFromUri(uri),
        databaseName: connInfo.databaseName,
        host: connInfo.hostName,
        status: 'Connected',
        createdAt: new Date().toISOString(),
        isActive: false,
        uri: uri,
        notes: notes || ''
    };

    const config = loadConfig();
    config.push(newCluster);
    saveConfig(config);

    let secondaryUri = uri;
    if (secondaryUri.startsWith('mongodb+srv://')) {
        const rewritten = await rewriteSrvUri(secondaryUri);
        if (rewritten) {
            secondaryUri = rewritten;
        }
    }

    const conn = mongoose.createConnection(secondaryUri, mongooseOptions);
    connections[clusterId] = conn;

    conn.on('connected', () => {
        newCluster.status = 'Connected';
        newCluster.host = conn.host;
        newCluster.databaseName = conn.name;
        saveConfig(loadConfig().map(c => c.clusterId === clusterId ? newCluster : c));
        console.log(`[DB] Dynamic cluster connected: ${newCluster.clusterName}`);
    });

    conn.on('error', (err) => {
        newCluster.status = 'Disconnected';
        saveConfig(loadConfig().map(c => c.clusterId === clusterId ? newCluster : c));
        console.error(`[DB] Error in dynamic cluster: ${newCluster.clusterName}`, err.message);
    });

    for (const name of Object.keys(schemas)) {
        try {
            conn.model(name, schemas[name]);
        } catch (e) {}
    }

    return { success: true, cluster: newCluster };
};

const makeClusterActive = async (clusterId) => {
    const config = loadConfig();
    const found = config.find(c => c.clusterId === clusterId);
    if (!found) {
        throw new Error('Cluster not found');
    }
    
    config.forEach(c => {
        c.isActive = (c.clusterId === clusterId);
    });
    saveConfig(config);
    return { success: true };
};

const removeCluster = async (clusterId) => {
    if (clusterId === 'default') {
        throw new Error('Primary database cluster cannot be removed.');
    }
    
    const config = loadConfig();
    const cluster = config.find(c => c.clusterId === clusterId);
    if (!cluster) {
        throw new Error('Cluster not found.');
    }
    
    if (cluster.isActive) {
        throw new Error('Active cluster cannot be removed. Please activate another cluster first.');
    }

    // 1. Close and remove connection from live connections map
    const conn = connections[clusterId];
    if (conn) {
        try {
            await conn.close();
        } catch (e) {
            // Ignore close errors
        }
        delete connections[clusterId];
    }

    // 2. Remove from config file
    const updatedConfig = config.filter(c => c.clusterId !== clusterId);
    saveConfig(updatedConfig);

    return { success: true, clusterName: cluster.clusterName };
};

module.exports = {
    connectDB,
    getHealthStatus,
    getRegisteredClustersList,
    getActiveClusterInfo,
    testClusterConnection,
    registerNewCluster,
    makeClusterActive,
    removeCluster,
    maskUri
};
