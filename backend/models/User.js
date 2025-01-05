// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const User = sequelize.define('User', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true
//     }
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   phone: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   role: {
//     type: DataTypes.STRING,
//     defaultValue: 'user'
//   },
//   address: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
//   latitude: {
//     type: DataTypes.DECIMAL(10, 8),
//     allowNull: true
//   },
//   longitude: {
//     type: DataTypes.DECIMAL(11, 8),
//     allowNull: true
//   }
// }, {
//   timestamps: true
// });


// module.exports = User;


const pool = require('../config/database');

class User {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.role = data.role;
    this.address = data.address;
    this.latitude = data.coordinates?.lat;
    this.longitude = data.coordinates?.lng;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const query = `
      INSERT INTO users 
      (name, email, password, phone, role, address, latitude, longitude) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userData.name,
      userData.email,
      userData.password,
      userData.phone,
      userData.role || 'user',
      userData.address,
      userData.coordinates?.lat,
      userData.coordinates?.lng
    ];

    const [result] = await pool.execute(query, values);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, userData) {
    const query = `
      UPDATE users 
      SET name = ?, email = ?, phone = ?, role = ?, address = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `;
    
    const values = [
      userData.name,
      userData.email,
      userData.phone,
      userData.role,
      userData.address,
      userData.coordinates?.lat,
      userData.coordinates?.lng,
      id
    ];

    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }
}

module.exports = User;