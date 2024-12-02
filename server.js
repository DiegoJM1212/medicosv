const express = require('express');
const sql = require('mssql');
const url = require('url');

const app = express();

// Database configuration
const config = {
  user: 'diego', // Usuario de SQL en Azure
  password: 'Paramore.1997', // Asegúrate de poner la contraseña correcta
  server: 'diegojm.database.windows.net', // Nombre del servidor de Azure SQL
  database: 'kawaipet', // Nombre de la base de datos en Azure
  options: {
    encrypt: true, // Habilita la encriptación para la conexión segura
    trustServerCertificate: false, // No confiar en certificados no firmados
  },
};

// Middleware to accept JSON requests
app.use(express.json());

// Middleware to log and clean all requests
app.use((req, res, next) => {
  // Decode and clean the URL
  const decodedUrl = decodeURIComponent(req.url);
  const cleanUrl = decodedUrl.replace(/\s+/g, '');
  
  console.log(`${new Date().toISOString()} - ${req.method} ${cleanUrl}`);
  
  // Update the request URL
  req.url = cleanUrl;
  next();
});

// Route to get all veterinarians
app.get('/veterinarios', async (req, res) => {
  console.log('Accessing /veterinarios route');
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT * FROM veterinarios');
    console.log('Veterinarians retrieved:', result.recordset.length);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error getting veterinarians:', err);
    res.status(500).json({ message: 'Error getting veterinarians', error: err.message });
  } finally {
    await sql.close();
  }
});

// Route to get a veterinarian by ID
app.get('/veterinario/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`Accessing /veterinario/${id} route`);
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM veterinarios WHERE id = ${id}`;
    if (result.recordset.length === 0) {
      console.log(`Veterinarian with ID ${id} not found`);
      return res.status(404).json({ message: 'Veterinarian not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error getting veterinarian:', err);
    res.status(500).json({ message: 'Error getting veterinarian', error: err.message });
  } finally {
    await sql.close();
  }
});

// Route to add a new veterinarian
app.post('/veterinario', async (req, res) => {
  const { nombre } = req.body;
  console.log('Adding new veterinarian:', nombre);
  try {
    if (!nombre) {
      return res.status(400).json({ message: 'Veterinarian name is required' });
    }
    await sql.connect(config);
    await sql.query`INSERT INTO veterinarios (nombre) VALUES (${nombre})`;
    res.status(201).json({ message: 'Veterinarian added successfully' });
  } catch (err) {
    console.error('Error adding veterinarian:', err);
    res.status(500).json({ message: 'Error adding veterinarian', error: err.message });
  } finally {
    await sql.close();
  }
});

// Route to update a veterinarian
app.put('/veterinario/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre } = req.body;
  console.log(`Updating veterinarian with ID ${id}`);
  try {
    if (!nombre) {
      return res.status(400).json({ message: 'Veterinarian name is required' });
    }
    await sql.connect(config);
    const result = await sql.query`UPDATE veterinarios SET nombre = ${nombre} WHERE id = ${id}`;
    if (result.rowsAffected[0] === 0) {
      console.log(`Veterinarian with ID ${id} not found for update`);
      return res.status(404).json({ message: 'Veterinarian not found' });
    }
    res.json({ message: 'Veterinarian updated successfully' });
  } catch (err) {
    console.error('Error updating veterinarian:', err);
    res.status(500).json({ message: 'Error updating veterinarian', error: err.message });
  } finally {
    await sql.close();
  }
});

// Route to delete a veterinarian
app.delete('/veterinario/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`Deleting veterinarian with ID ${id}`);
  try {
    await sql.connect(config);
    const result = await sql.query`DELETE FROM veterinarios WHERE id = ${id}`;
    if (result.rowsAffected[0] === 0) {
      console.log(`Veterinarian with ID ${id} not found for deletion`);
      return res.status(404).json({ message: 'Veterinarian not found' });
    }
    res.json({ message: 'Veterinarian deleted successfully' });
  } catch (err) {
    console.error('Error deleting veterinarian:', err);
    res.status(500).json({ message: 'Error deleting veterinarian', error: err.message });
  } finally {
    await sql.close();
  }
});

// Default route handler for undefined routes
app.use((req, res) => {
  console.log('Route not found:', req.url);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT;  // Render asignará un puerto automáticamente.
app.listen(PORT, () => {
    console.log(`API escuchando en el puerto ${PORT}`);
});
