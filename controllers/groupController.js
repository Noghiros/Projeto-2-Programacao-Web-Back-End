// controllers/groupController.js

const Group = require('../models/groupModel');
const fs = require('fs');

function logError(error) {
  fs.appendFile('error.log', `${new Date().toISOString()} - ${error}\n`, (err) => {
    if (err) console.error('Erro ao escrever no log:', err);
  });
}

exports.createGroup = async (req, res, fields) => {
  const { name, members } = fields || req.body;
  if (!name || !members || !Array.isArray(members) || members.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Nome do grupo e membros são obrigatórios.' }));
  }
  try {
    const group = new Group({ name, members });
    await group.save();
    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(group));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno ao criar grupo.' }));
  }
};

module.exports = {
  async listGroups() {
    try {
      return await Group.find().populate('members');
    } catch (error) {
      logError(error);
      throw error;
    }
  },

  async deleteGroup(groupId) {
    try {
      return await Group.findByIdAndDelete(groupId);
    } catch (error) {
      logError(error);
      throw error;
    }
  }
};
