import { fetchOriginalPublicationYear } from './apiService';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock global fetch
global.fetch = jest.fn();

describe('fetchOriginalPublicationYear', () => {
  beforeEach(() => {
    fetch.mockClear();
    sessionStorage.clear();
    
    // Default success response for any call
    fetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    }));
  });

  test('returns the earliest year from Open Library while matching author', async () => {
    const mockResponse = {
      docs: [
        {
          author_name: ['Claire Keegan'],
          first_publish_year: 1900, // Error in DB
          publish_year: [1900, 2010, 2022]
        },
        {
          author_name: ['Claire Keegan'],
          first_publish_year: 2010,
          publish_year: [2010, 2011]
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const year = await fetchOriginalPublicationYear('Foster', 'Claire Keegan');
    
    // Should skip 1900 and find 2010
    expect(year).toBe(2010);
  });

  test('validates author name strictly', async () => {
    const mockResponse = {
      docs: [
        {
          author_name: ['Some Other Author'],
          first_publish_year: 1950,
          publish_year: [1950]
        },
        {
          author_name: ['Joan Didion'],
          first_publish_year: 1979,
          publish_year: [1979, 1980]
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const year = await fetchOriginalPublicationYear('The White Album', 'Joan Didion');
    
    // Should skip the 1950 result because author doesn't match
    expect(year).toBe(1979);
  });

  test('cleans title of subtitles before searching', async () => {
    await fetchOriginalPublicationYear('The White Album: Essays', 'Joan Didion');
    
    // Check that the fetch URL used the cleaned title
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain('title=The+White+Album');
    expect(calledUrl).not.toContain('Essays');
  });

  test('ignores placeholder years like 1900 and 1901', async () => {
    const mockResponse = {
      docs: [
        {
          author_name: ['Test Author'],
          first_publish_year: 1900,
          publish_year: [1900, 1901, 2020]
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const year = await fetchOriginalPublicationYear('Modern Book', 'Test Author');
    expect(year).toBe(2020);
  });

  test('uses cache on subsequent calls', async () => {
    const mockResponse = {
      docs: [{ author_name: ['Author A'], first_publish_year: 2005 }]
    };

    // First call uses fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const year1 = await fetchOriginalPublicationYear('Book A', 'Author A');
    expect(year1).toBe(2005);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const year2 = await fetchOriginalPublicationYear('Book A', 'Author A');
    expect(year2).toBe(2005);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

