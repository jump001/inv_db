// Import Express
const express = require('express')

// Import Moment เพื่อไว้จัดรูปแบบวันที่
const moment = require('moment')

// Import OjectID ของ MongoDB
const objectId = require('mongodb').ObjectId

const router = express.Router()

// Import mongodb_dbconfig
const { connectDb, getDb } = require('../config/mongdb_dbconfig')
var db
connectDb(() => (db = getDb()))

// CRUD Category ================================================
// Read Category
router.get('/categories', async (req, res)=>{
    const categories = await db.collection('category').find({}).sort({CategoryID:-1}).toArray()
    res.json(categories)
})

// Read Category By ID
router.get('/category/:id', async (req, res)=>{
    const objID = new objectId(req.params.id)
    const category = await db.collection('category').find({"_id" : objID}).toArray()
    res.json(category)
})

// Create Category POST
router.post('/create_category', async (req, res)=>{

    // การอ่านหมายเลข CategoryID ล่าสุด
    const category = await db.collection('category').findOne({}, {sort: {CategoryID:-1}, limit: 1})
    const categoryID = category.CategoryID + 1

    // รับค่าจากฟอร์ม
    let CategoryName = req.body.CategoryName
    let CategoryStatus = req.body.CategoryStatus
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(CategoryName.length === 0 || CategoryStatus === '')
    {
        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'ป้อนข้อมูลในฟิลด์ให้ครบก่อน'})

    }else{
        // Insert to mongodb
        await db.collection('category').insertOne({
            CategoryID: categoryID,
            CategoryName: CategoryName,
            CategoryStatus: parseInt(CategoryStatus),
            CreatedDate: curdatetime,
            ModifiedDate: curdatetime
        })

        res.json({'msg':'เพิ่มรายการเรียบร้อย'})
    }
})

// Edit Category PUT
router.put('/edit_category/:id', async (req, res)=>{
    // console.log(req.params.id)

    const objID = new objectId(req.params.id)

    // รับค่าจากฟอร์ม
    let CategoryName = req.body.CategoryName
    let CategoryStatus = req.body.CategoryStatus
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(CategoryName.length === 0 || CategoryStatus === '')
    {
        res.json({'msg':'ป้อนข้อมูลในฟิลด์ให้ครบก่อน'})

    }else{
        // Update to mongodb
        await db.collection('category').updateOne({ _id: objID}, 
        {
			$set: {
                CategoryName: CategoryName,
                CategoryStatus: parseInt(CategoryStatus),
                ModifiedDate: curdatetime
			}
		})

        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'แก้ไขรายการเรียบร้อย'})
    }
    
})

// DELETE Category
router.delete('/delete_category/:id', async (req, res)=>{

    const objID = new objectId(req.params.id)
    await db.collection('category').deleteOne({"_id" : objID})
    res.json({'msg':'ลบรายการเรียบร้อย'})

})

// CRUD Products =====================================================
// Read All Products
router.get('/products', async (req, res)=>{

    const products = await db.collection('products').aggregate(
        [
            {
               $lookup: {
                 from: 'category',
                 localField: 'CategoryID',
                 foreignField: 'CategoryID',
                 as: 'category'
               } 
            },
            {
                $match:{
                    "products":{"$ne":[]}
                }
            },
            { 
                $sort: {
                    "_id": -1
                }
            },
        ]
    ).toArray()

    res.json(products)

})

// Read Product by ID
router.get('/product/:id', async (req, res)=>{

    const objID = new objectId(req.params.id)
    const product = await db.collection('products').aggregate(
        [
            {
               $lookup: {
                 from: 'category',
                 localField: 'CategoryID',
                 foreignField: 'CategoryID',
                 as: 'category'
               } 
            },
            {
                $match:{
                    "_id":objID
                }
            },
        ]
    ).toArray()

    res.json(product)

})

// Create Product POST
router.post('/create_product', async (req, res)=>{

    // Increment ProductID
    const product = await db.collection('products').findOne({}, {sort: {ProductID: -1}, limit: 1 })
    const productID = product.ProductID + 1

    // รับค่าจากฟอร์ม
    let ProductName = req.body.ProductName
    let CategoryID = req.body.CategoryID
    let UnitPrice = req.body.UnitPrice
    let UnitInStock = req.body.UnitInStock
    let ProductPicture = req.body.ProductPicture
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(CategoryID === '' || ProductName.length === 0 || UnitPrice === '' || UnitInStock === '')
    {
        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'ป้อนข้อมูลในฟิลด์ให้ครบก่อน'})

    }else{
        // Insert to mongodb
        await db.collection('products').insertOne({
            ProductID: productID,
            CategoryID: parseInt(CategoryID),
            ProductName: ProductName,
            UnitPrice: parseInt(UnitPrice),
            ProductPicture: ProductPicture,
            UnitInStock: parseInt(UnitInStock),
            CreatedDate: curdatetime,
            ModifiedDate: curdatetime
        })

        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'เพิ่มรายการเรียบร้อย'})
    }
})

// Edit Product PUT
router.put('/edit_product/:id', async (req, res)=>{
    // console.log(req.params.id)

    const objID = new objectId(req.params.id)

    // รับค่าจากฟอร์ม
    let CategoryID = req.body.CategoryID
    let ProductName = req.body.ProductName
    let UnitPrice = req.body.UnitPrice
    let UnitInStock = req.body.UnitInStock
    let ProductPicture = req.body.ProductPicture
    let curdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    // Validate ฟอร์มว่าป้อนข้อมูลครบหรือยัง
    if(ProductName.length === 0 || UnitPrice === '' || UnitInStock === '')
    {
        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'ป้อนข้อมูลในฟิลด์ให้ครบก่อน'})

    }else{
        // Update to mongodb
        await db.collection('products').updateOne({ _id: objID}, 
        {
			$set: {
				CategoryID: parseInt(CategoryID),
                ProductName: ProductName,
                UnitPrice: parseInt(UnitPrice),
                ProductPicture: ProductPicture,
                UnitInStock: parseInt(UnitInStock),
                ModifiedDate: curdatetime
			}
		})

        // แสดงข้อความแจ้งเตือน
        res.json({'msg':'แก้ไขรายการเรียบร้อย'})
    }
    
})

// DELETE Product
router.delete('/delete_product/:id', async (req, res)=>{

    const objID = new objectId(req.params.id)
    await db.collection('products').deleteOne({"_id" : objID})
    res.json({'msg':'ลบรายการเรียบร้อย'})

})

module.exports = router