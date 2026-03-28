const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';

let ioInstance = null;

const normalizeRole = (role) => (role === 'user' ? 'candidate' : role);

const initSocket = ({ httpServer, isAllowedOrigin }) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  ioInstance.use(async (socket, next) => {
    try {
      const bearerToken = socket.handshake.headers?.authorization || '';
      const tokenFromHeader = bearerToken.startsWith('Bearer ') ? bearerToken.slice(7) : '';
      const token = socket.handshake.auth?.token || tokenFromHeader;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role isActive').lean();

      if (!user || user.isActive === false) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.user = {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: normalizeRole(user.role)
      };

      return next();
    } catch (_error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.user?.id;
    const role = socket.user?.role;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (role) {
      socket.join(`role:${role}`);
    }

    socket.emit('socket:connected', {
      userId,
      role,
      connectedAt: new Date().toISOString()
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

const emitToUser = (userId, eventName, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${String(userId)}`).emit(eventName, payload);
};

const emitToRole = (role, eventName, payload) => {
  if (!ioInstance || !role) return;
  ioInstance.to(`role:${normalizeRole(role)}`).emit(eventName, payload);
};

const emitToRoles = (roles = [], eventName, payload) => {
  if (!Array.isArray(roles)) return;
  roles.forEach((role) => emitToRole(role, eventName, payload));
};

module.exports = { initSocket, getIO, emitToUser, emitToRole, emitToRoles };