import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json()); // Đảm bảo server có thể parse body của request

const sqlConfig = {
  user: 'haobkh',
  password: 'haobk',
  database: 'Hallure',
  server: 'DESKTOP-173GCII\\SQLEXPRESS',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 60000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


// tìm kiếm khách hàng
app.get('/api/customers', async (req, res) => {
    try {
        const { name, phone } = req.query; // Đọc từ req.query thay vì req.body

        if (!name && !phone) {
            return res.status(400).send('Name or phone is required');
        }

        await sql.connect(sqlConfig);

        let query = `
            SELECT name, phone, address, Height, Weight, BodyMeasurements
            FROM oms.MB_Customer
            WHERE 1=1
        `;

        if (name) {
            query += ` AND name = N'${name}'`; // Sử dụng N'' cho Unicode
        }

        if (phone) {
            query += ` AND phone = '${phone}'`;
        }

        const result = await sql.query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi khi kết nối tới SQL Server:', err.message);
        res.status(500).send('Lỗi khi lấy dữ liệu từ SQL Server');
    }
});

// Danh sách khách hàng

app.get('/api/customers/information', async (req, res) => {
    try {
      await sql.connect(sqlConfig);
      
      const result = await sql.query(`
        SELECT TOP(10) name, phone, address, Height, Weight, BodyMeasurements
        FROM oms.MB_Customer
        WHERE Weight is not null
      `);
  
      res.json(result.recordset);
    } catch (err) {
      console.error('Lỗi khi kết nối tới SQL Server:', err);
      res.status(500).send('Lỗi khi lấy dữ liệu từ SQL Server');
    }
  });



  app.get('/api/products', async (req, res) => {
    try {
      // Kết nối đến SQL Server
      await sql.connect(sqlConfig);
  
      // Truy vấn dữ liệu từ cơ sở dữ liệu
      const result = await sql.query(`
        ;WITH DistinctProducts AS (
            SELECT
                MP.[M_Product_Id],
                MP.[Name] AS ProductName,
                MP.[Price],
                AF.[FilePath] AS ImagePath,
                AF.[FileName],
                ROW_NUMBER() OVER (PARTITION BY MP.[Name] ORDER BY MP.[M_Product_Id]) AS RowNum
            FROM 
                [Hallure].[oms].[M_Product] AS MP
            INNER JOIN 
                [Hallure].[dbo].[App_File_Ref] AS AFR ON MP.[M_Product_Id] = AFR.[RefId]
            INNER JOIN 
                [Hallure].[dbo].[App_File] AS AF ON AFR.[App_File_Id] = AF.[App_File_Id]
            WHERE 
                AF.[FilePath] LIKE 'public%'
        )
        SELECT 
            x.[ID],
            x.[TinhSanPhamETL],
            x.[NhomMauSacETL],
            x.[NhomSanPhamCap1ETL],
            x.[NhomSanPhamCap2ETL],
            x.[KieuDangETL],
            x.[IdMauSacETL],
            x.[IdNhomSanPhamETL],
            x.[NgayTaoETL],
            x.[TenSanPhamChaETL],
            DP.[M_Product_Id],
            DP.[ProductName],
            DP.[Price],
            DP.[ImagePath],
            DP.[FileName]
        FROM 
            [Hallure].[stg].[nhanhvn_dm_SanPham] AS x
        INNER JOIN 
            DistinctProducts AS DP ON x.[ID] = DP.[M_Product_Id]
        WHERE 
            DP.RowNum = 1
        ORDER BY 
            DP.[ProductName]; 

      `);
  
      // Chỉ cần trả về dữ liệu như vậy nếu ImagePath đã có URL đầy đủ
      const products = result.recordset;
  
      // Trả về kết quả dưới dạng JSON
      res.json(products);
    } catch (err) {
      console.error('Lỗi khi kết nối tới SQL Server:', err);
      res.status(500).send('Lỗi khi lấy dữ liệu từ SQL Server');
    }
  });
  
// Endpoint để lọc sản phẩm theo màu
app.get('/api/products/color', async (req, res) => {
    const { color } = req.query;
    
    // Câu lệnh SQL để lấy sản phẩm theo màu
    const query = `
      ;WITH DistinctProducts AS (
          SELECT
              MP.[M_Product_Id],
              MP.[Name] AS ProductName,
              MP.[Price],
              AF.[FilePath] AS ImagePath,
              AF.[FileName],
              ROW_NUMBER() OVER (PARTITION BY MP.[Name] ORDER BY MP.[M_Product_Id]) AS RowNum
          FROM 
              [Hallure].[oms].[M_Product] AS MP
          INNER JOIN 
              [Hallure].[dbo].[App_File_Ref] AS AFR ON MP.[M_Product_Id] = AFR.[RefId]
          INNER JOIN 
              [Hallure].[dbo].[App_File] AS AF ON AFR.[App_File_Id] = AF.[App_File_Id]
          WHERE 
              AF.[FilePath] LIKE 'public%'
      )
      SELECT 
          x.[ID],
          x.[TinhSanPhamETL],
          x.[NhomMauSacETL],
          x.[NhomSanPhamCap1ETL],
          x.[NhomSanPhamCap2ETL],
          x.[KieuDangETL],
          x.[IdMauSacETL],
          x.[IdNhomSanPhamETL],
          x.[NgayTaoETL],
          x.[TenSanPhamChaETL],
          DP.[M_Product_Id],
          DP.[ProductName],
          DP.[Price],
          DP.[ImagePath],
          DP.[FileName]
      FROM 
          [Hallure].[stg].[nhanhvn_dm_SanPham] AS x
      INNER JOIN 
          DistinctProducts AS DP ON x.[ID] = DP.[M_Product_Id]
      WHERE 
          DP.RowNum = 1
      ORDER BY 
          DP.[ProductName]; 
    `;
    
    try {
      const result = await db.query(query, {
        replacements: {
          color: color || ''
        },
        type: db.QueryTypes.SELECT
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });

// Endpoint để lấy thông tin sản phẩm dựa trên ID
app.get('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).send('Invalid product ID');
  }

  try {
    await sql.connect(sqlConfig);

    const request = new sql.Request();

    // Thực hiện stored procedure
    const result = await request
      .input('M_Product_ID', sql.Int, productId)
      .execute('stg.GetProductDetails');

    if (result.recordset.length === 0) {
      return res.status(404).send('Product not found');
    }

    // Gộp các ảnh lại và lấy thông tin sản phẩm
    const product = result.recordset[0];
    product.Images = result.recordset.map(row => row.ImagePath);

    res.json(product);
  } catch (err) {
    console.error('Error fetching product details:', err.message);
    res.status(500).send('Error retrieving product details');
  } finally {
    sql.close();
  }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
