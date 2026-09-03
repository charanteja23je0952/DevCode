const seedUsers = [
  { _id: 'u1', name: 'John Smith', email: 'john.smith@example.com' },
  { _id: 'u2', name: 'John Smith', email: 'johnsmith@example.com' },
  { _id: 'u3', name: 'Sara Conner', email: 'sara.conner@acme.com' },
  { _id: 'u4', name: 'Sarah Connor', email: 'sarah.connor@acme.com' },
  { _id: 'u5', name: 'Alice Brown', email: 'alice.brown@example.com' },
  { _id: 'u6', name: 'Alice Brown', email: 'alice.brown@other.com' }
];

export function installInMemoryAdapter(Model, initialUsers = seedUsers) {
  let users = structuredClone(initialUsers);

  Model.find = async function find() {
    return structuredClone(users);
  };

  Model.insertMany = async function insertMany(newUsers) {
    users = users.concat(structuredClone(newUsers));
    return structuredClone(newUsers);
  };

  return {
    reset(nextUsers = seedUsers) {
      users = structuredClone(nextUsers);
    }
  };
}
