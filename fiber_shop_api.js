export default async function handler(req, res) {
  const { query } = req.query;
  const mockData = {
    query: query,
    results: [
      {
        productId: 'prod_123',
        title: 'Blue Adidas Running Shoes',
        brand: 'Adidas',
        price: 99.99,
        priceFormatted: '$99.99',
        inStock: true,
        shop: {
          merchantId: 456,
          name: 'Nike Store',
          domain: 'nikestore.com',
          score: 8.5
        },
        cashback: {
          rate: '5%',
          amount: 5.0,
          type: 'percentage',
          allRates: []
        }
      },
      {
        productId: 'prod_456',
        title: 'Red Adidas Hoodie',
        brand: 'Adidas',
        price: 79.99,
        priceFormatted: '$79.99',
        inStock: true,
        shop: {
          merchantId: 789,
          name: 'Adidas Outlet',
          domain: 'adidasoutlet.com',
          score: 7.9
        },
        cashback: {
          rate: '3%',
          amount: 2.4,
          type: 'percentage',
          allRates: []
        }
      },
      {
        productId: 'prod_789',
        title: 'White Adidas T-shirt',
        brand: 'Adidas',
        price: 39.99,
        priceFormatted: '$39.99',
        inStock: false,
        shop: {
          merchantId: 101,
          name: 'Adidas Online Store',
          domain: 'adidas.com',
          score: 9.2
        },
        cashback: {
          rate: '2%',
          amount: 0.8,
          type: 'percentage',
          allRates: []
        }
      }
    ],
    pagination: {
      total: 45,
      page: 0,
      totalPages: 3
    }
  };

  res.status(200).json(mockData);
}