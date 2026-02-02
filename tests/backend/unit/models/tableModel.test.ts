import { TableModel } from '../../../src/backend/models/tableModel';
import { getDb } from '../../../src/backend/config/database';

// Mock the database module
jest.mock('../../../src/backend/config/database');

const mockDb = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn(),
};

(getDb as jest.Mock).mockResolvedValue(mockDb);

describe('TableModel', () => {
  let tableModel: TableModel;

  beforeEach(() => {
    tableModel = new TableModel();
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tables', async () => {
      const mockTables = [
        { id: '1', number: 1, status: 'AVAILABLE' },
        { id: '2', number: 2, status: 'OCCUPIED' },
      ];
      mockDb.all.mockResolvedValue(mockTables);

      const result = await tableModel.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM restaurant_tables', []);
      expect(result).toEqual(mockTables);
    });

    it('should return empty array when no tables exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await tableModel.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return table when found', async () => {
      const mockTable = { id: '1', number: 1, status: 'AVAILABLE' };
      mockDb.get.mockResolvedValue(mockTable);

      const result = await tableModel.findById('1');

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM restaurant_tables WHERE id = ?',
        ['1'],
      );
      expect(result).toEqual(mockTable);
    });

    it('should return undefined when table not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await tableModel.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByNumber', () => {
    it('should return table by number', async () => {
      const mockTable = { id: '1', number: 5, status: 'AVAILABLE' };
      mockDb.get.mockResolvedValue(mockTable);

      const result = await tableModel.findByNumber(5);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM restaurant_tables WHERE number = ?',
        [5],
      );
      expect(result).toEqual(mockTable);
    });

    it('should return undefined when table number not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await tableModel.findByNumber(999);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new table with default status', async () => {
      const newTable = {
        number: 10,
      };

      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await tableModel.create(newTable);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
        [expect.any(String), 10, 'AVAILABLE'],
      );
      expect(result).toEqual(expect.any(String));
    });

    it('should create a new table with custom status', async () => {
      const newTable = {
        number: 10,
        status: 'OCCUPIED',
      };

      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await tableModel.create(newTable);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
        [expect.any(String), 10, 'OCCUPIED'],
      );
      expect(result).toEqual(expect.any(String));
    });
  });

  describe('update', () => {
    it('should update table number', async () => {
      const updateData = { number: 15 };

      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await tableModel.update('1', updateData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE restaurant_tables SET number = ? WHERE id = ?',
        [15, '1'],
      );
      expect(result).toBe(true);
    });

    it('should update table status', async () => {
      const updateData = { status: 'RESERVED' };

      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await tableModel.update('1', updateData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE restaurant_tables SET status = ? WHERE id = ?',
        ['RESERVED', '1'],
      );
      expect(result).toBe(true);
    });

    it('should update both number and status', async () => {
      const updateData = { number: 20, status: 'OCCUPIED' };

      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await tableModel.update('1', updateData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE restaurant_tables SET number = ?, status = ? WHERE id = ?',
        [20, 'OCCUPIED', '1'],
      );
      expect(result).toBe(true);
    });

    it('should return false when no fields to update', async () => {
      const result = await tableModel.update('1', {});

      expect(mockDb.run).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when table not found', async () => {
      const updateData = { number: 15 };

      mockDb.run.mockResolvedValue({ changes: 0 });

      const result = await tableModel.update('non-existent', updateData);

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a table and return true', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await tableModel.delete('1');

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM restaurant_tables WHERE id = ?',
        ['1'],
      );
      expect(result).toBe(true);
    });

    it('should return false when table not found', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      const result = await tableModel.delete('non-existent');

      expect(result).toBe(false);
    });
  });
});
