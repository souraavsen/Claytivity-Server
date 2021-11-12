const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

// Middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfxhs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("Claytivity");
    const useProductsCollection = database.collection("Products");

    
//Product CRD, Details
    // Get method for all products
    app.get("/all-products", async (req, res) => {
      const products = await useProductsCollection.find({}).toArray();
      res.send(products);
    });

    // // product DETAILS
    app.get("/product-details/:id", async (req, res) => {
      const ID = req.params.id;
      const product = { _id: ObjectId(ID) };
      const productDetails = await useProductsCollection.findOne(product);
      res.send(productDetails);
    });

    //POST new product
    app.post("/add-products", async (req, res) => {
      const productData = await useProductsCollection.insertOne(req.body);
      res.json(productData);
    });
      
    app.delete("/delete-product/:id", async (req, res) => {
        const productId = req.params.id;
        const filterProduct = { _id: ObjectId(productId) };
        const result = await useProductsCollection.deleteOne(filterProduct);
        console.log("Product Deleted", result);
        res.json(result);
    });
      
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Claytivity Server is UP and Running");
});

app.listen(port, () => {
  console.log("Running Claytivity Server on Port ", port);
});
