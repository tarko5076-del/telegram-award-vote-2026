// backend/controllers/nomineeController.js
const { getAllNominees } = require('../models/nomineeModel');

// Custom mapping for better display titles and descriptions
const categoryInfo = {
  'Best Informative': {
    title: 'Best Informative',

  },
  'Best Memer': {
    title: 'Best Memer',
    
  },
  'Best Editor and Designer': {
    title: 'Best Editor & Designer',
    
  },
  'Lifestyle': {
    title: 'Best Lifestyle',
   
  },
  'Businessman': {
    title: 'Best Businessman / Entrepreneur',
    
  },
  'Best Football Player': {
    title: 'Best Football Player',
    
  },
  'Best Artist': {
   
    
  }
  // Add more categories here in the future if needed
};

const getNominees = async (req, res) => {
  try {
    const nominees = await getAllNominees();

    // Group nominees by category
    const grouped = nominees.reduce((acc, nom) => {
      const cat = nom.category;

      if (!acc[cat]) {
        // Use custom info if available, otherwise fallback to raw category name
        acc[cat] = {
          title: categoryInfo[cat]?.title || cat,
          description: categoryInfo[cat]?.description || `Vote for the best in ${cat.toLowerCase()}`,
          nominees: []
        };
      }

      acc[cat].nominees.push(nom);
      return acc;
    }, {});

    // Convert object to sorted array (optional: sort by title)
    const result = Object.values(grouped).sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    res.json(result);
  } catch (err) {
    console.error('Error fetching nominees:', err);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
};

module.exports = { getNominees };