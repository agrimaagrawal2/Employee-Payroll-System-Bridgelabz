const fs = require('fs').promises;

const FILE = 'employees.json';

exports.read = async () => {
  try {
    const data = await fs.readFile(FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
};

exports.write = async (data) => {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
};
