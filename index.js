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
// app.use(express.static("public"));
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
    const useOrdersCollection = database.collection("Orders");
    const useReviewsCollection = database.collection("Reviews");
    const useUsersCollection = database.collection("Users");

    //Product CRD, Details
    // Get method for all products
    app.get("/all-products", async (req, res) => {
      const products = await useProductsCollection.find({}).toArray();
      res.json(products);
    });

    // // product DETAILS
    app.get("/product-details/:id", async (req, res) => {
      const ID = req.params.id;
      const product = { _id: ObjectId(ID) };
      const productDetails = await useProductsCollection.findOne(product);
      res.json(productDetails);
    });

    //POST new product
    app.post("/add-product", async (req, res) => {
      const productData = await useProductsCollection.insertOne(req.body);
      res.json(productData);
    });

    app.delete("/delete-product/:id", async (req, res) => {
      const productId = req.params.id;
      const filterProduct = { _id: ObjectId(productId) };
      const result = await useProductsCollection.deleteOne(filterProduct);
      res.json(result);
    });

    //Order CRUD, Details
    //get all orders
    app.get("/all-orders", async (req, res) => {
      const orders = await useOrdersCollection.find({}).toArray();
      res.json(orders);
    });

    //post order
    app.post("/add-order", async (req, res) => {
      const itemData = await useOrdersCollection.insertOne(req.body);
      res.json(itemData);
    });

    //Order Details
    app.get("/order-details/:id", async (req, res) => {
      const ID = req.params.id;
      const orderID = { _id: ObjectId(ID) };
      const orderDetails = await useOrdersCollection.findOne(orderID);
      res.json(orderDetails);
    });

    // Update Order
    app.put("/order/update/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: req.body.status,
        },
      };
      const result = await useOrdersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/order-payment/update/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const payment = req.body;
      console.log(payment);
      const updateDoc = {
        $set: {
          paid: true,
          payment: payment,
        },
      };
      const result = await useOrdersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // DELETE a order
    app.delete("/remove-order/:id", async (req, res) => {
      const bookingId = req.params.id;
      const bookedplan = { _id: ObjectId(bookingId) };
      const result = await useOrdersCollection.deleteOne(bookedplan);
      res.json(result);
    });

    // Payment API
    app.post("/create-payment-intent", async (req, res) => {
      const paymentDetails = req.body;
      console.log(paymentDetails);
      const amount = paymentDetails.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      console.log(paymentIntent);

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //Review CRUD, Details
    //get all orders
    app.get("/all-reviews", async (req, res) => {
      const reviews = await useReviewsCollection.find({}).toArray();
      res.json(reviews);
    });

    //post order
    app.post("/add-review", async (req, res) => {
      const reviewData = await useReviewsCollection.insertOne(req.body);
      res.json(reviewData);
    });

    //For User operations
    //Saving user information in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await useUsersCollection.insertOne(user);
      res.json(result);
    });

    //update and store the users
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await useUsersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //set the admin role
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await useUsersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //checking the admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await useUsersCollection.findOne(query);

      res.json(user);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.json("Claytivity Server is UP and Running");
});

app.listen(port, () => {
  console.log("Running Claytivity Server on Port ", port);
});
