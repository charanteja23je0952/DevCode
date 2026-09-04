import mongoose from "mongoose";

const stores = new Map(); 
function getStore(modelName) {
  if (!stores.has(modelName)) stores.set(modelName, new Map());
  return stores.get(modelName);
}
function matchesFilter(doc, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === "_id") return String(doc._id) === String(value);
    return doc[key] === value;
  });
}
function applySort(docs, sortSpec) {
  if (!sortSpec) return docs;
  const [[field, dir]] = Object.entries(sortSpec);
  return [...docs].sort((a, b) => {
    if (a[field] < b[field]) return dir === -1 ? 1 : -1;
    if (a[field] > b[field]) return dir === -1 ? -1 : 1;
    return 0;
  });
}

export function useInMemoryStore(Model) {
  const store = getStore(Model.modelName);

  Model.prototype.save = async function () {
    await this.validate();               
    const doc = this.toObject();
    const now = new Date();

    if (!doc.createdAt) {
      doc.createdAt = now;
    }
    doc.updatedAt = now;
    
    store.set(String(doc._id), doc);
    return this;
  };

  Model.find = (filter = {}) => {
    const resultPromise = (async () =>
      [...store.values()].filter((d) => matchesFilter(d, filter)))();
    return {
      sort(sortSpec) { return resultPromise.then((docs) => applySort(docs, sortSpec)); },
      then(resolve, reject) { return resultPromise.then(resolve, reject); },
    };
  };

  Model.findOne = async (filter = {}) =>
    [...store.values()].find((d) => matchesFilter(d, filter)) ?? null;

  Model.findById = async (id) =>
    [...store.values()].find((d) => String(d._id) === String(id)) ?? null;

  Model.findByIdAndUpdate = async (id, updates) => {
    const existing = store.get(String(id));
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    store.set(String(id), updated);
    return updated;
  };

  Model.findByIdAndDelete = async (id) => {
    const existing = store.get(String(id));
    if (!existing) return null;
    store.delete(String(id));
    return existing;
  };

  return Model;
}