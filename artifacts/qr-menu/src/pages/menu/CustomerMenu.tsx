import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import {
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon, Flame, Plus, X, Minus, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CartSheet } from "../../components/menu/CartSheet";
import { ItemDetailsSheet } from "../../components/menu/ItemDetailsSheet";

/* ─── Real mock data — Snacky Cafe Kakkanchery ───────────────────────── */
const MOCK_MENU = {
  restaurant: {
    id: 1, name: "Snacky Cafe", slug: "snacky-cafe-kakkanchery",
    logoUrl: "https://res.cloudinary.com/dzhenfgol/image/upload/v1769858951/brands/brands/69727d62c940196190b9428c/e2d289d2-d01b-4d40-ae52-6f0ceaf5f210.jpg",
    description: "12 curated menu sections",
  },
  categories: [
    { id: 1,  name: "Combo Deals",   imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=120&h=120&fit=crop&q=80", sortOrder: 1 },
    { id: 2,  name: "Shakes",        imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=120&h=120&fit=crop&q=80", sortOrder: 2 },
    { id: 3,  name: "Juice",         imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=120&h=120&fit=crop&q=80", sortOrder: 3 },
    { id: 4,  name: "Tea",           imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=120&h=120&fit=crop&q=80", sortOrder: 4 },
    { id: 5,  name: "Falooda",       imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=120&h=120&fit=crop&q=80", sortOrder: 5 },
    { id: 6,  name: "Mojito",        imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=120&h=120&fit=crop&q=80", sortOrder: 6 },
    { id: 7,  name: "Lime Drinks",   imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=120&h=120&fit=crop&q=80", sortOrder: 7 },
    { id: 8,  name: "Avil Milk",     imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&h=120&fit=crop&q=80", sortOrder: 8 },
    { id: 9,  name: "Fruit Salad",   imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=120&h=120&fit=crop&q=80", sortOrder: 9 },
    { id: 10, name: "Burger",        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop&q=80", sortOrder: 10 },
    { id: 11, name: "Club Sandwich", imageUrl: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=120&h=120&fit=crop&q=80", sortOrder: 11 },
    { id: 12, name: "Momos",         imageUrl: "https://images.unsplash.com/photo-1534422298546-5f49e756d89a?w=120&h=120&fit=crop&q=80", sortOrder: 12 },
  ],
  items: [
    { id: 1,  name: "Fried Chicken Combo",        price: 69,  type: "non-veg", isCombo: true,  isSpicy: true,  isAvailable: true, categoryId: 1,  comboItemCount: 1, sortOrder: 1,  imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop&q=80" },
    { id: 2,  name: "Fried Chicken Platter",      price: 260, type: "non-veg", isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 1, sortOrder: 2,  imageUrl: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=200&h=200&fit=crop&q=80" },
    { id: 3,  name: "Fried Chicken Family Pack",  price: 490, type: "non-veg", isCombo: true,  isSpicy: true,  isAvailable: true, categoryId: 1,  comboItemCount: 1, sortOrder: 3,  imageUrl: "https://images.unsplash.com/photo-1585325701165-fdd19b27f8ab?w=200&h=200&fit=crop&q=80" },
    { id: 4,  name: "Fried Chicken Bucket",       price: 140, type: "non-veg", isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 1, sortOrder: 4,  imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=200&h=200&fit=crop&q=80" },
    { id: 5,  name: "Anar Shake",                 price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 5,  imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop&q=80" },
    { id: 6,  name: "Mango Shake",                price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 6,  imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=200&h=200&fit=crop&q=80" },
    { id: 7,  name: "Pappaya Shake",              price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 7,  imageUrl: "https://images.unsplash.com/photo-1541615742938-e3eb61ca9e9c?w=200&h=200&fit=crop&q=80" },
    { id: 8,  name: "Dry Fruit Shake",            price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 8,  imageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop&q=80" },
    { id: 9,  name: "Strawberry Shake",           price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 9,  imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop&q=80" },
    { id: 10, name: "Banana Shake",               price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 10, imageUrl: "https://images.unsplash.com/photo-1481671703460-040cb8a2d909?w=200&h=200&fit=crop&q=80" },
    { id: 11, name: "Tender Coconut",             price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 11, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop&q=80" },
    { id: 12, name: "Water Melon Juice",          price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 12, imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&h=200&fit=crop&q=80" },
    { id: 13, name: "Orange Juice",               price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 13, imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop&q=80" },
    { id: 14, name: "Pine Apple Juice",           price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 14, imageUrl: "https://images.unsplash.com/photo-1571950006418-f7ad93b30f37?w=200&h=200&fit=crop&q=80" },
    { id: 15, name: "Burthu Kal",                 price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 15, imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=200&h=200&fit=crop&q=80" },
    { id: 16, name: "Normal Tea",                 price: 10,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 16, imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop&q=80" },
    { id: 17, name: "Coffee",                     price: 15,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 17, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&q=80" },
    { id: 18, name: "Lemon Tea",                  price: 15,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 18, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&q=80" },
    { id: 19, name: "Masala Tea",                 price: 20,  type: "veg",     isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 19, imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&h=200&fit=crop&q=80" },
    { id: 20, name: "Green Tea",                  price: 20,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 20, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&q=80" },
    { id: 21, name: "Tender Falooda",             price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 21, imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&h=200&fit=crop&q=80" },
    { id: 22, name: "Normal Falooda",             price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 22, imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=200&h=200&fit=crop&q=80" },
    { id: 23, name: "Royal Falooda",              price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 23, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&q=80" },
    { id: 24, name: "Chinese Falooda",            price: 160, type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 24, imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop&q=80" },
    { id: 25, name: "Thalassery Falooda",         price: 180, type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 25, imageUrl: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=200&h=200&fit=crop&q=80" },
    { id: 26, name: "Orange Mojito",              price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 26, imageUrl: "https://images.unsplash.com/photo-1560963342-c7a7f31cff76?w=200&h=200&fit=crop&q=80" },
    { id: 27, name: "Green Apple Mojito",         price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 27, imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=200&fit=crop&q=80" },
    { id: 28, name: "Mango Mojito",               price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 28, imageUrl: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=200&h=200&fit=crop&q=80" },
    { id: 29, name: "Strawberry Mojito",          price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 29, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop&q=80" },
    { id: 30, name: "Blue Mojito",                price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 30, imageUrl: "https://images.unsplash.com/photo-1571950006418-f7ad93b30f37?w=200&h=200&fit=crop&q=80" },
    { id: 31, name: "Fresh Lime",                 price: 15,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 31, imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=200&h=200&fit=crop&q=80" },
    { id: 32, name: "Grape Lime",                 price: 20,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 32, imageUrl: "https://images.unsplash.com/photo-1567523291022-dd6b7a29a52e?w=200&h=200&fit=crop&q=80" },
    { id: 33, name: "Mint Lime",                  price: 20,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 33, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&q=80" },
    { id: 34, name: "Pine Apple Lime",            price: 20,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 34, imageUrl: "https://images.unsplash.com/photo-1571950006418-f7ad93b30f37?w=200&h=200&fit=crop&q=80" },
    { id: 35, name: "Tender Avilmilk",            price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 35, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80" },
    { id: 36, name: "Normal Avil Milk",           price: 40,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 36, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop&q=80" },
    { id: 37, name: "Special Avil Milk",          price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 37, imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=200&h=200&fit=crop&q=80" },
    { id: 38, name: "Normal Fruit Salad",         price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 38, imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&q=80" },
    { id: 39, name: "Special Fruit Salad",        price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 39, imageUrl: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=200&h=200&fit=crop&q=80" },
    { id: 40, name: "Icecream Scoop",             price: 30,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 40, imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop&q=80" },
    { id: 41, name: "Chicken Zinger Burger",      price: 99,  type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 41, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80" },
    { id: 42, name: "Veg Burger",                 price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 42, imageUrl: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=200&fit=crop&q=80" },
    { id: 43, name: "Hot Burger",                 price: 99,  type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 43, imageUrl: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=200&h=200&fit=crop&q=80" },
    { id: 44, name: "Chicken Double Burger",      price: 120, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 44, imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=200&h=200&fit=crop&q=80" },
    { id: 45, name: "Jumbo Burger",               price: 180, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 45, imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=200&h=200&fit=crop&q=80" },
    { id: 46, name: "Snacky Special Burger",      price: 210, type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 46, imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop&q=80" },
    { id: 47, name: "Chicken Zinger Sandwich",    price: 120, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 47, imageUrl: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=200&h=200&fit=crop&q=80" },
    { id: 48, name: "Veg Club Sandwich",          price: 99,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 48, imageUrl: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=200&h=200&fit=crop&q=80" },
    { id: 49, name: "Spicy Club Sandwich",        price: 150, type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 49, imageUrl: "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=200&h=200&fit=crop&q=80" },
    { id: 50, name: "Snacky Special Club Sandwich",price:160, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 50, imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop&q=80" },
    { id: 51, name: "Fried Momos",                price: 60,  type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 51, imageUrl: "https://images.unsplash.com/photo-1534422298546-5f49e756d89a?w=200&h=200&fit=crop&q=80" },
    { id: 52, name: "Creamy Momos",               price: 70,  type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 52, imageUrl: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=200&h=200&fit=crop&q=80" },
    { id: 53, name: "Sehezwan Momos",             price: 80,  type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 53, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop&q=80" },
    // ── Combo Deals extra (→10) ─────────────────────────────────────────
    { id: 54, name: "Veg Combo Meal",             price: 99,  type: "veg",     isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 2, sortOrder: 54, imageUrl: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=200&fit=crop&q=80" },
    { id: 55, name: "Snacky Special Combo",        price: 149, type: "non-veg", isCombo: true,  isSpicy: true,  isAvailable: true, categoryId: 1,  comboItemCount: 2, sortOrder: 55, imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop&q=80" },
    { id: 56, name: "Chicken Burger Combo",        price: 129, type: "non-veg", isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 2, sortOrder: 56, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80" },
    { id: 57, name: "Mojito + Fries Combo",        price: 110, type: "veg",     isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 2, sortOrder: 57, imageUrl: "https://images.unsplash.com/photo-1560963342-c7a7f31cff76?w=200&h=200&fit=crop&q=80" },
    { id: 58, name: "Family Party Pack",           price: 599, type: "non-veg", isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 4, sortOrder: 58, imageUrl: "https://images.unsplash.com/photo-1585325701165-fdd19b27f8ab?w=200&h=200&fit=crop&q=80" },
    { id: 59, name: "Kids Meal Combo",             price: 89,  type: "veg",     isCombo: true,  isSpicy: false, isAvailable: true, categoryId: 1,  comboItemCount: 2, sortOrder: 59, imageUrl: "https://images.unsplash.com/photo-1564844536311-de546a28c87d?w=200&h=200&fit=crop&q=80" },
    // ── Shakes extra (→10) ──────────────────────────────────────────────
    { id: 60, name: "KitKat Shake",               price: 100, type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 60, imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=200&h=200&fit=crop&q=80" },
    { id: 61, name: "Oreo Shake",                 price: 95,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 61, imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop&q=80" },
    { id: 62, name: "Dates Shake",                price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 62, imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=200&h=200&fit=crop&q=80" },
    { id: 63, name: "Coconut Shake",              price: 85,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 2,  comboItemCount: 0, sortOrder: 63, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop&q=80" },
    // ── Juice extra (→10) ───────────────────────────────────────────────
    { id: 64, name: "Grape Juice",                price: 55,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 64, imageUrl: "https://images.unsplash.com/photo-1567523291022-dd6b7a29a52e?w=200&h=200&fit=crop&q=80" },
    { id: 65, name: "Pomegranate Juice",          price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 65, imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&h=200&fit=crop&q=80" },
    { id: 66, name: "Mixed Fruit Juice",          price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 66, imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop&q=80" },
    { id: 67, name: "Carrot Juice",               price: 50,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 67, imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&h=200&fit=crop&q=80" },
    { id: 68, name: "Beetroot Juice",             price: 55,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 3,  comboItemCount: 0, sortOrder: 68, imageUrl: "https://images.unsplash.com/photo-1571950006418-f7ad93b30f37?w=200&h=200&fit=crop&q=80" },
    // ── Tea extra (→10) ─────────────────────────────────────────────────
    { id: 69, name: "Ginger Tea",                 price: 15,  type: "veg",     isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 69, imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&h=200&fit=crop&q=80" },
    { id: 70, name: "Cardamom Tea",               price: 15,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 70, imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop&q=80" },
    { id: 71, name: "Iced Tea",                   price: 30,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 71, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&q=80" },
    { id: 72, name: "Turmeric Tea",               price: 20,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 72, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&q=80" },
    { id: 73, name: "Rose Tea",                   price: 25,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 4,  comboItemCount: 0, sortOrder: 73, imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop&q=80" },
    // ── Falooda extra (→10) ─────────────────────────────────────────────
    { id: 74, name: "Pista Falooda",              price: 100, type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 74, imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&h=200&fit=crop&q=80" },
    { id: 75, name: "Rose Falooda",               price: 85,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 75, imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=200&h=200&fit=crop&q=80" },
    { id: 76, name: "Mango Falooda",              price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 76, imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop&q=80" },
    { id: 77, name: "Chocolate Falooda",          price: 95,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 77, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&q=80" },
    { id: 78, name: "Strawberry Falooda",         price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 5,  comboItemCount: 0, sortOrder: 78, imageUrl: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=200&h=200&fit=crop&q=80" },
    // ── Mojito extra (→10) ──────────────────────────────────────────────
    { id: 79, name: "Litchi Mojito",              price: 85,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 79, imageUrl: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=200&h=200&fit=crop&q=80" },
    { id: 80, name: "Watermelon Mojito",          price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 80, imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=200&fit=crop&q=80" },
    { id: 81, name: "Kiwi Mojito",                price: 85,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 81, imageUrl: "https://images.unsplash.com/photo-1560963342-c7a7f31cff76?w=200&h=200&fit=crop&q=80" },
    { id: 82, name: "Pineapple Mojito",           price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 82, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop&q=80" },
    { id: 83, name: "Coconut Mojito",             price: 85,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 6,  comboItemCount: 0, sortOrder: 83, imageUrl: "https://images.unsplash.com/photo-1571950006418-f7ad93b30f37?w=200&h=200&fit=crop&q=80" },
    // ── Lime Drinks extra (→10) ─────────────────────────────────────────
    { id: 84, name: "Salt Lime Soda",             price: 20,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 84, imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=200&h=200&fit=crop&q=80" },
    { id: 85, name: "Honey Lime",                 price: 25,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 85, imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=200&h=200&fit=crop&q=80" },
    { id: 86, name: "Ginger Lime",                price: 25,  type: "veg",     isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 86, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&q=80" },
    { id: 87, name: "Rose Lime",                  price: 25,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 87, imageUrl: "https://images.unsplash.com/photo-1567523291022-dd6b7a29a52e?w=200&h=200&fit=crop&q=80" },
    { id: 88, name: "Jaljeera",                   price: 20,  type: "veg",     isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 88, imageUrl: "https://images.unsplash.com/photo-1571950006418-f7ad93b30f37?w=200&h=200&fit=crop&q=80" },
    { id: 89, name: "Nimbu Pani",                 price: 15,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 7,  comboItemCount: 0, sortOrder: 89, imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=200&h=200&fit=crop&q=80" },
    // ── Avil Milk extra (→10) ───────────────────────────────────────────
    { id: 90, name: "Rose Avil Milk",             price: 55,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 90, imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=200&h=200&fit=crop&q=80" },
    { id: 91, name: "Mango Avil Milk",            price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 91, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80" },
    { id: 92, name: "Strawberry Avil Milk",       price: 55,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 92, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop&q=80" },
    { id: 93, name: "Chocolate Avil Milk",        price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 93, imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=200&h=200&fit=crop&q=80" },
    { id: 94, name: "Dry Fruit Avil Milk",        price: 70,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 94, imageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop&q=80" },
    { id: 95, name: "Pista Avil Milk",            price: 65,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 95, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80" },
    { id: 96, name: "Butterscotch Avil Milk",     price: 65,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 8,  comboItemCount: 0, sortOrder: 96, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop&q=80" },
    // ── Fruit Salad extra (→10) ─────────────────────────────────────────
    { id: 97,  name: "Chocolate Fruit Salad",     price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 97,  imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop&q=80" },
    { id: 98,  name: "Honey Fruit Salad",         price: 70,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 98,  imageUrl: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=200&h=200&fit=crop&q=80" },
    { id: 99,  name: "Mango Fruit Salad",         price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 99,  imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&q=80" },
    { id: 100, name: "Seasonal Fruit Bowl",        price: 75,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 100, imageUrl: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=200&h=200&fit=crop&q=80" },
    { id: 101, name: "Watermelon Bowl",            price: 60,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 101, imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&h=200&fit=crop&q=80" },
    { id: 102, name: "Custard Fruit Salad",        price: 85,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 102, imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop&q=80" },
    { id: 103, name: "Rainbow Fruit Salad",        price: 90,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 9,  comboItemCount: 0, sortOrder: 103, imageUrl: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=200&h=200&fit=crop&q=80" },
    // ── Burger extra (→10) ──────────────────────────────────────────────
    { id: 104, name: "BBQ Burger",                 price: 130, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 104, imageUrl: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=200&fit=crop&q=80" },
    { id: 105, name: "Mushroom Burger",             price: 110, type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 105, imageUrl: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=200&h=200&fit=crop&q=80" },
    { id: 106, name: "Paneer Burger",               price: 99,  type: "veg",     isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 106, imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=200&h=200&fit=crop&q=80" },
    { id: 107, name: "Volcano Burger",              price: 160, type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 10, comboItemCount: 0, sortOrder: 107, imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=200&h=200&fit=crop&q=80" },
    // ── Club Sandwich extra (→10) ───────────────────────────────────────
    { id: 108, name: "BBQ Chicken Sandwich",        price: 140, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 108, imageUrl: "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=200&h=200&fit=crop&q=80" },
    { id: 109, name: "Paneer Tikka Sandwich",       price: 120, type: "veg",     isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 109, imageUrl: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=200&h=200&fit=crop&q=80" },
    { id: 110, name: "Egg Mayo Sandwich",           price: 99,  type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 110, imageUrl: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=200&h=200&fit=crop&q=80" },
    { id: 111, name: "Grilled Sandwich",            price: 110, type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 111, imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop&q=80" },
    { id: 112, name: "BLT Sandwich",                price: 130, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 112, imageUrl: "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=200&h=200&fit=crop&q=80" },
    { id: 113, name: "Double Decker Sandwich",      price: 175, type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 11, comboItemCount: 0, sortOrder: 113, imageUrl: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=200&h=200&fit=crop&q=80" },
    // ── Momos extra (→10) ───────────────────────────────────────────────
    { id: 114, name: "Tandoori Momos",              price: 90,  type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 114, imageUrl: "https://images.unsplash.com/photo-1534422298546-5f49e756d89a?w=200&h=200&fit=crop&q=80" },
    { id: 115, name: "Steamed Momos",               price: 60,  type: "non-veg", isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 115, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop&q=80" },
    { id: 116, name: "Corn Momos",                  price: 65,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 116, imageUrl: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=200&h=200&fit=crop&q=80" },
    { id: 117, name: "Paneer Momos",                price: 75,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 117, imageUrl: "https://images.unsplash.com/photo-1534422298546-5f49e756d89a?w=200&h=200&fit=crop&q=80" },
    { id: 118, name: "Cheese Momos",                price: 80,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 118, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop&q=80" },
    { id: 119, name: "Veg Momos",                   price: 55,  type: "veg",     isCombo: false, isSpicy: false, isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 119, imageUrl: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=200&h=200&fit=crop&q=80" },
    { id: 120, name: "Soup Momos",                  price: 90,  type: "non-veg", isCombo: false, isSpicy: true,  isAvailable: true, categoryId: 12, comboItemCount: 0, sortOrder: 120, imageUrl: "https://images.unsplash.com/photo-1534422298546-5f49e756d89a?w=200&h=200&fit=crop&q=80" },
  ],
  offers: [{
    id: 1, title: "Birthday Offer", description: "10% off on your birthday",
    discountPercent: 10, validUntil: "2026-12-31T23:59:00Z",
    imageUrl: "https://res.cloudinary.com/dzhenfgol/image/upload/v1769859076/outlets/outlets/69727d62c940196190b9428c/ff469eb7-c6b4-423e-a678-b04e11df6213.jpg",
  }],
};

/* (DesktopRedirect removed — menu is now responsive for all devices) */

/* ─── Type dot ─────────────────────────────────────────────────────────── */
const TypeDot = ({ type }: { type: string }) => {
  const colors: Record<string, string> = { veg: "border-green-600 bg-green-600", "non-veg": "border-red-600 bg-red-600", beverage: "border-blue-400 bg-blue-400" };
  const c = colors[type] ?? colors.veg;
  return (
    <div className={`w-[14px] h-[14px] border-[1.5px] flex items-center justify-center rounded-[2px] shrink-0 bg-white ${c.split(" ")[0]}`}>
      <div className={`w-[7px] h-[7px] rounded-full ${c.split(" ")[1]}`} />
    </div>
  );
};

/* ─── List row ─────────────────────────────────────────────────────────── */
const ItemRow = ({ item, cartQty = 0, onIncrement, onDecrement, onClick }: { item: any, cartQty?: number, onIncrement?: () => void, onDecrement?: () => void, onClick?: () => void }) => (
  <div onClick={onClick} className="flex gap-4 p-4 mb-3 mx-3 md:mx-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] items-start relative cursor-pointer hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow">
    <div className="flex-1 min-w-0 flex flex-col h-full justify-center">
      <div className="flex items-center gap-1.5 mb-1.5">
        <TypeDot type={item.type} />
        {item.isCombo && <span className="text-[9px] font-bold px-1.5 py-[2px] border border-amber-300 text-amber-700 bg-amber-50 rounded-[4px] uppercase tracking-wider">COMBO</span>}
        {item.isSpicy && <div className="flex text-red-500 bg-red-50 rounded px-1 py-0.5"><Flame className="w-3 h-3" fill="currentColor" /></div>}
      </div>
      <p className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 pr-1">{item.name}</p>
      <p className="font-medium text-gray-400 text-[12px] mt-0.5">Freshly prepared</p>
      
      <div className="mt-2.5 flex items-center justify-between">
        <p className="font-extrabold text-gray-900 text-[16px] tracking-tight">₹{item.price}</p>
      </div>
    </div>
    <div className="shrink-0 relative flex flex-col items-center">
      <div className="relative shadow-sm rounded-2xl overflow-hidden">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="w-[110px] h-[110px] object-cover" onError={e => (e.currentTarget.style.display = "none")} />
          : <div className="w-[110px] h-[110px] bg-gray-50 flex items-center justify-center p-2"><div className="w-full h-full bg-gray-200 rounded-lg" /></div>}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-black text-gray-700 bg-white shadow-md px-2 py-1 rounded tracking-wide uppercase">Sold Out</span>
          </div>
        )}
      </div>
      {(cartQty && cartQty > 0) ? (
        <div className="relative -mt-3 z-10 flex items-center justify-between px-2 py-1.5 w-[84px] bg-green-50 rounded-lg shadow-md border border-green-200" onClick={e => e.stopPropagation()}>
          <button onClick={onDecrement} className="p-1 rounded bg-white text-green-700 shadow-sm active:scale-95"><Minus className="w-3.5 h-3.5 stroke-[3]" /></button>
          <span className="font-extrabold text-[13px] text-green-700">{cartQty}</span>
          <button onClick={onIncrement} className="p-1 rounded bg-white text-green-700 shadow-sm active:scale-95"><Plus className="w-3.5 h-3.5 stroke-[3]" /></button>
        </div>
      ) : (
        <button 
          disabled={!item.isAvailable}
          onClick={(e) => { e.stopPropagation(); if (onIncrement) onIncrement(); }}
          className={`relative -mt-3 z-10 px-5 py-1.5 flex items-center justify-center gap-1 rounded-lg shadow-md font-extrabold text-[12px] leading-none border transition-transform active:scale-95 ${item.isAvailable ? "bg-white text-green-600 border-green-100 hover:bg-green-50" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
          ADD <Plus className="w-3.5 h-3.5 stroke-[3] text-green-500" />
        </button>
      )}
    </div>
  </div>
);

/* ─── Grid card ────────────────────────────────────────────────────────── */
const ItemCard = ({ item, cartQty = 0, onIncrement, onDecrement, onClick }: { item: any, cartQty?: number, onIncrement?: () => void, onDecrement?: () => void, onClick?: () => void }) => (
  <div onClick={onClick} className="bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] relative cursor-pointer hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow">
    <div className="relative">
      {item.imageUrl
        ? <img src={item.imageUrl} alt={item.name} className="w-full h-[120px] object-cover" onError={e => (e.currentTarget.style.display = "none")} />
        : <div className="w-full h-[120px] bg-gray-100" />}
      
      {!item.isAvailable && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-10">
          <span className="text-[10px] font-black text-gray-700 bg-white shadow-md px-2 py-1 rounded tracking-wide uppercase">Sold Out</span>
        </div>
      )}
    </div>

    <div className="p-3 flex-1 flex flex-col pb-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <TypeDot type={item.type} />
          {item.isCombo && <span className="text-[8px] font-bold px-1 border border-amber-300 text-amber-700 bg-amber-50 rounded-[3px] uppercase">COMBO</span>}
        </div>
      </div>
      <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
      
      <div className="mt-auto pt-3 pb-3 flex items-center justify-between">
        <p className="text-[15px] font-extrabold text-gray-900 tracking-tight">₹{item.price}</p>
        {(cartQty && cartQty > 0) ? (
          <div className="flex items-center justify-between px-1.5 py-1 w-[72px] bg-green-50 rounded-lg shadow-sm border border-green-200">
            <button onClick={onDecrement} className="p-1 rounded bg-white text-green-700 shadow-sm active:scale-95"><Minus className="w-3 h-3 stroke-[3]" /></button>
            <span className="font-extrabold text-[12px] text-green-700">{cartQty}</span>
            <button onClick={onIncrement} className="p-1 rounded bg-white text-green-700 shadow-sm active:scale-95"><Plus className="w-3 h-3 stroke-[3]" /></button>
          </div>
        ) : (
          <button 
            disabled={!item.isAvailable}
            onClick={onIncrement}
            className={`px-3 py-1.5 flex items-center justify-center gap-1 rounded-lg shadow-sm font-bold text-[11px] leading-none border transition-transform active:scale-95 ${item.isAvailable ? "bg-white text-green-600 border-green-100 hover:bg-green-50" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
            ADD <Plus className="w-3 h-3 stroke-[3] text-green-500" />
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ─── Main ─────────────────────────────────────────────────────────────── */
export default function CustomerMenu() {
  const { restaurantId } = useParams();

  /* ── Data ── */
  const [menu, setMenu] = useState<typeof MOCK_MENU | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rId = parseInt(restaurantId || "1", 10);
    fetch(`/api/restaurants/${rId}/menu`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setMenu(data))
      .catch(() => setMenu(MOCK_MENU))
      .finally(() => setIsLoading(false));
  }, [restaurantId]);

  /* ── UI state ── */
  const [activeTab, setActiveTab]       = useState<"All"|"Veg"|"Non"|"Beverage">("All");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [isGridView, setIsGridView]     = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState<"recommended"|"price_asc"|"price_desc">("recommended");
  const [isSpicyFilter, setIsSpicyFilter] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<any>(null);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);

  const scrollRef   = useRef<HTMLDivElement>(null);
  const sidebarRef  = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);
  const offersScrollRef = useRef<HTMLDivElement>(null);
  const isUserClickRef = useRef(false);

  /* ── Cart state ── */
  const [cart, setCart] = useState<Record<number, number>>({});
  
  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  }, []);

  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalPrice = Object.entries(cart).reduce((total, [idStr, qty]) => {
    const it = menu?.items?.find((i: any) => i.id === parseInt(idStr, 10));
    return total + (it ? it.price * qty : 0);
  }, 0);

  /* ── Auto slider for offers ── */
  useEffect(() => {
    if (!menu?.offers?.length || !offersScrollRef.current) return;
    const interval = setInterval(() => {
      const el = offersScrollRef.current;
      if (!el) return;
      const scrollAmount = el.clientWidth * 0.85; // slide by almost one full card
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" }); // loop back
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [menu?.offers]);

  /* ── Init first category ── */
  useEffect(() => {
    if (menu?.categories?.length && activeCategory === null)
      setActiveCategory(menu.categories[0].id);
  }, [menu, activeCategory]);

  /* ── IntersectionObserver: scroll → sidebar ── */
  useEffect(() => {
    if (!menu?.categories || !scrollRef.current) return;
    const container = scrollRef.current;
    const visMap = new Map<number, number>();
    const observers: IntersectionObserver[] = [];

    const pickActive = () => {
      if (isUserClickRef.current) return;
      let bestId: number | null = null, bestRatio = -1;
      visMap.forEach((r, id) => { if (r > bestRatio) { bestRatio = r; bestId = id; } });
      if (bestId === null) return;
      setActiveCategory(prev => {
        if (prev === bestId) return prev;
        requestAnimationFrame(() => {
          const el = document.getElementById(`sidebar-cat-${bestId}`);
          if (el && sidebarRef.current) {
            const ct = sidebarRef.current.scrollTop;
            const ch = sidebarRef.current.clientHeight;
            if (el.offsetTop < ct || el.offsetTop + el.offsetHeight > ct + ch)
              sidebarRef.current.scrollTo({ top: el.offsetTop - ch / 2 + el.offsetHeight / 2, behavior: "smooth" });
          }
        });
        return bestId;
      });
    };

    menu.categories.forEach(cat => {
      const el = document.getElementById(`cat-section-${cat.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { visMap.set(cat.id, entry.intersectionRatio); pickActive(); },
        { root: container, rootMargin: "-5% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [menu?.categories]);

  /* ── Sidebar click → scroll ── */
  const handleCategoryClick = useCallback((id: number) => {
    setActiveCategory(id);
    setSearchQuery("");       // clear search on category click
    setIsSearchOpen(false);
    isUserClickRef.current = true;
    const el = document.getElementById(`cat-section-${id}`);
    if (el && scrollRef.current) {
      const container = scrollRef.current;
      const targetTop = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
      const FILTER_BAR_H = 49; // sticky filter bar height
      container.scrollTo({ top: targetTop - FILTER_BAR_H, behavior: "smooth" });
    }
    setTimeout(() => { isUserClickRef.current = false; }, 900);
  }, []);

  /* ── Focus search input when opened ── */
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [isSearchOpen]);

  /* ── Filtered & sorted items ── */
  const filteredItems = useMemo(() => {
    if (!menu?.items) return [];
    const q = searchQuery.trim().toLowerCase();
    let items = menu.items.filter(item => {
      if (activeTab === "Veg"     && item.type !== "veg")      return false;
      if (activeTab === "Non"     && item.type !== "non-veg")  return false;
      if (activeTab === "Beverage"&& item.type !== "beverage") return false;
      if (isSpicyFilter && !item.isSpicy)                       return false;
      if (q && !item.name.toLowerCase().includes(q))            return false;
      return true;
    });
    if (sortBy === "price_asc")  items = [...items].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") items = [...items].sort((a, b) => b.price - a.price);
    else items = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    return items;
  }, [menu?.items, activeTab, isSpicyFilter, sortBy, searchQuery]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<number, typeof filteredItems>();
    menu?.categories?.forEach(cat => map.set(cat.id, []));
    map.set(-1, []);
    filteredItems.forEach(item => {
      const id = (item as any).categoryId ?? -1;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(item);
    });
    return map;
  }, [filteredItems, menu?.categories]);

  const isSearchActive = searchQuery.trim().length > 0;
  const hasActiveFilters = isSpicyFilter || sortBy !== "recommended" || activeTab !== "All";

  /* ─── Desktop redirect ── */
  /* ──────── Loading skeleton ──────── */
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 flex items-center gap-3 border-b max-w-5xl mx-auto w-full">
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="ml-auto h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-24 w-full rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
      </div>
      <div className="flex flex-1">
        <div className="w-[76px] bg-gray-50 border-r space-y-1">
          {[...Array(8)].map((_, i) => <div key={i} className="h-[76px] w-full bg-gray-200 animate-pulse" />)}
        </div>
        <div className="flex-1 p-3 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!menu) return <div className="p-8 text-center text-gray-500">Menu not found</div>;

  const { restaurant, categories, offers } = menu;

  const formatOfferDate = (d: string | null | undefined) => {
    if (!d) return null;
    try { const dt = new Date(d); return { day: dt.getDate(), month: dt.toLocaleString("default", { month: "short" }).toUpperCase() }; }
    catch { return null; }
  };

  /* ──────── Render ──────── */
  return (
    <>
      <style>{`.hscroll::-webkit-scrollbar{display:none}.hscroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      <div className="h-[100dvh] overflow-hidden bg-white flex flex-col">

        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-100 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3 px-4 md:px-8 py-2.5 w-full max-w-5xl mx-auto">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border border-gray-200 shrink-0">
              {restaurant.logoUrl
                ? <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                : <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">{restaurant.name.charAt(0)}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-[14px] md:text-[18px] truncate leading-tight">{restaurant.name}</p>
              {restaurant.description && <p className="text-[11px] text-gray-400 truncate hidden md:block">{restaurant.description}</p>}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto hscroll" style={{ overscrollBehavior: "contain" }}>

          {/* Special Offers — large auto-sliding banner */}
          {offers?.length > 0 && (
            <div className="bg-white border-b border-gray-100 py-3 md:py-5">
              <div 
                ref={offersScrollRef}
                className="flex gap-4 px-4 md:px-8 hscroll overflow-x-auto snap-x snap-mandatory max-w-5xl mx-auto pb-1"
              >
                {offers.map((offer: any) => {
                  return (
                    <div key={offer.id} className="snap-center shrink-0 w-[85%] sm:w-[340px] md:w-[420px] h-[130px] md:h-[160px] bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden relative shadow-sm border border-gray-100">
                      {offer.imageUrl ? (
                        <>
                          <img src={offer.imageUrl} alt={offer.title} className="absolute inset-0 w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                          {/* Gradient to ensure text is readable over any uploaded image */}
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/60 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-500" />
                      )}

                      <div className="relative z-10 h-full flex flex-col justify-center p-5 md:p-6 text-white w-full pr-[80px]">
                        <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black tracking-widest mb-1.5 md:mb-2 self-start uppercase shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-white/30 animate-pulse">
                          <Flame className="w-3.5 h-3.5 text-amber-300" /> TRENDING DEAL
                        </div>
                        <h3 className="font-extrabold text-[18px] md:text-[22px] leading-tight mb-1 text-white text-shadow-sm line-clamp-2">{offer.title}</h3>
                        {offer.description && <p className="text-white/90 font-medium text-[11px] md:text-[13px] line-clamp-2 leading-snug">{offer.description}</p>}
                      </div>

                      {/* Right side floating element */}
                      {offer.discountPercent && (
                        <div className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-[65px] h-[65px] md:w-[80px] md:h-[80px] bg-yellow-400 text-yellow-900 rounded-full shadow-lg border-[3px] border-white z-20 shrink-0 transform rotate-12">
                          <span className="text-[20px] md:text-[24px] font-black leading-none -mb-1">{offer.discountPercent}%</span>
                          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wide">OFF</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Sticky filter bar ── */}
          <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)] shrink-0">
            <div className="max-w-5xl mx-auto">
              {/* Search bar — expands when open */}
              {isSearchOpen ? (
                <div className="flex items-center gap-2 px-4 md:px-8 py-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search menu…"
                    className="flex-1 text-[14px] outline-none bg-transparent text-gray-900 placeholder-gray-400"
                  />
                  <button onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 md:px-8 py-2">
                  <div className="flex gap-1.5 hscroll overflow-x-auto">
                    {(["All", "Veg", "Non", "Beverage"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${activeTab === tab ? "bg-[#22c55e] text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 ml-auto border-l border-gray-200 pl-2 shrink-0">
                    <button onClick={() => setIsSearchOpen(true)} className={`p-1.5 rounded-full transition-colors ${isSearchActive ? "text-[#22c55e] bg-green-50" : "text-gray-500 hover:bg-gray-100"}`}>
                      <Search className="w-[18px] h-[18px]" />
                    </button>
                    <button onClick={() => setIsFilterOpen(true)} className={`p-1.5 rounded-full transition-colors ${hasActiveFilters ? "text-[#22c55e] bg-green-50" : "text-gray-500 hover:bg-gray-100"}`}>
                      <SlidersHorizontal className="w-[18px] h-[18px]" />
                    </button>
                    <button onClick={() => setIsGridView(true)}  className={`p-1.5 rounded-md transition-colors ${isGridView  ? "bg-[#22c55e] text-white" : "text-gray-500 hover:bg-gray-100"}`} aria-label="Grid view">
                      <LayoutGrid className="w-[18px] h-[18px]" />
                    </button>
                    <button onClick={() => setIsGridView(false)} className={`p-1.5 rounded-md transition-colors ${!isGridView ? "bg-[#22c55e] text-white" : "text-gray-500 hover:bg-gray-100"}`} aria-label="List view">
                      <ListIcon className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              )}
              {/* Active search badge */}
              {isSearchActive && (
                <div className="px-4 md:px-8 pb-1.5 flex items-center gap-2">
                  <span className="text-[12px] text-gray-500">
                    {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for <strong>"{searchQuery}"</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar + items ── */}
          <div className="flex max-w-5xl mx-auto w-full" style={{ minHeight: "80vh" }}>

            {/* Left sidebar — narrow pill on mobile, wide text-list on desktop */}
            <div ref={sidebarRef}
              className="shrink-0 hscroll overflow-y-auto sticky self-start"
              style={{
                width: "clamp(76px, 18vw, 200px)",
                top: "49px",
                maxHeight: "calc(100dvh - 50px)",
                background: "#f9fafb",
                borderRight: "1px solid #e8e8e8"
              }}>
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                const hasItems = (itemsByCategory.get(cat.id)?.length ?? 0) > 0;
                return (
                  <button key={cat.id} id={`sidebar-cat-${cat.id}`} onClick={() => handleCategoryClick(cat.id)}
                    style={{ opacity: hasItems || !isSearchActive ? 1 : 0.35 }}
                    className={`w-full text-left transition-all focus:outline-none flex items-center gap-0 md:gap-3
                      ${ isActive
                        ? "bg-[#33a02c] shadow-sm transform scale-[1.02]"
                        : "border-l-[3px] border-transparent hover:bg-gray-100" }
                    `}>
                    {/* Mobile: icon-only pill column */}
                    <div className="flex flex-col items-center py-2.5 px-1 w-full md:hidden">
                      <div className={`w-[50px] h-[50px] rounded-[10px] overflow-hidden border-2 shadow-sm transition-all ${ isActive ? "border-white/40 ring-2 ring-transparent bg-white/20" : "border-white/20 bg-white" }`}>
                        {(cat as any).imageUrl
                          ? <img src={(cat as any).imageUrl} alt={cat.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-200">{cat.name.charAt(0)}</div>}
                      </div>
                      <span className={`text-center text-[13px] font-bold leading-tight mt-1.5 px-1 line-clamp-2 ${ isActive ? "text-white" : "text-gray-500" }`}>{cat.name}</span>
                    </div>
                    {/* Desktop: image + text row */}
                    <div className="hidden md:flex items-center gap-2.5 py-3 px-3 w-full">
                      <div className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm border ${ isActive ? "border-transparent bg-white/20" : "bg-white border-gray-100" }`}>
                        {(cat as any).imageUrl
                          ? <img src={(cat as any).imageUrl} alt={cat.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-300 bg-gray-100">{cat.name.charAt(0)}</div>}
                      </div>
                      <span className={`text-[16px] font-bold leading-tight line-clamp-2 ${ isActive ? "text-white" : "text-gray-700" }`}>{cat.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right items panel */}
            <div className="flex-1 min-w-0 bg-white">
              {isSearchActive && filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No items found</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                  <button onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                    className="mt-4 text-[#22c55e] font-semibold text-sm">Clear search</button>
                </div>
              ) : (
                categories.map(cat => {
                  const items = itemsByCategory.get(cat.id) ?? [];
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.id} id={`cat-section-${cat.id}`}>
                      <div className="sticky top-[49px] z-10 flex items-center justify-between px-3 md:px-4 pt-3 pb-2 bg-gray-50/95 border-b border-gray-100 backdrop-blur-sm">
                        <h2 className="font-bold text-[15px] md:text-[16px] text-gray-900">{cat.name}</h2>
                        <span className="text-[11px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">{items.length} items</span>
                      </div>
                      {isGridView
                        ? <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 px-2 py-2">{items.map(item => <ItemCard key={item.id} item={item} cartQty={cart[item.id] || 0} onIncrement={() => updateQuantity(item.id, 1)} onDecrement={() => updateQuantity(item.id, -1)} onClick={() => setSelectedDetailsItem(item)} />)}</div>
                        : <div className="md:grid md:grid-cols-2">{items.map(item => <ItemRow key={item.id} item={item} cartQty={cart[item.id] || 0} onIncrement={() => updateQuantity(item.id, 1)} onDecrement={() => updateQuantity(item.id, -1)} onClick={() => setSelectedDetailsItem(item)} />)}</div>}
                    </div>
                  );
                })
              )}
              <div className="h-24" />
            </div>
          </div>
        </div>

        {/* ── Filter bottom sheet ── */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
            <div className="relative bg-white rounded-t-3xl p-6 pb-8 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-bold text-gray-900">Filter &amp; Sort</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 font-semibold text-[14px]">Cancel</button>
              </div>
              <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-3">SORT BY</p>
              <RadioGroup value={sortBy} onValueChange={val => setSortBy(val as any)} className="flex flex-col gap-2 mb-6">
                {[{ value: "recommended", label: "Recommended" }, { value: "price_asc", label: "Price: Low to High" }, { value: "price_desc", label: "Price: High to Low" }]
                  .map(opt => (
                    <label key={opt.value} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 cursor-pointer border border-gray-100">
                      <span className="text-[14px] font-medium text-gray-800">{opt.label}</span>
                      <RadioGroupItem value={opt.value} id={opt.value} className="border-gray-300 data-[state=checked]:border-[#22c55e] data-[state=checked]:bg-[#22c55e]" />
                    </label>
                  ))}
              </RadioGroup>
              <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-3">QUICK FILTERS</p>
              <div className="flex gap-2 mb-8">
                <button onClick={() => setIsSpicyFilter(s => !s)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${isSpicyFilter ? "border-[#22c55e] text-[#22c55e] bg-green-50" : "border-gray-200 text-gray-700 bg-white"}`}>
                  <Flame className="w-3.5 h-3.5" /> Spicy
                </button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-[14px] font-semibold border-gray-200 text-gray-700"
                  onClick={() => { setSortBy("recommended"); setIsSpicyFilter(false); setActiveTab("All"); }}>
                  Reset All
                </Button>
                <Button className="flex-1 h-12 rounded-xl text-[14px] font-bold bg-[#22c55e] hover:bg-[#16a34a] text-white"
                  onClick={() => setIsFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* ── Floating Bottom Cart ── */}
        {cartTotalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-40 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none flex justify-center">
            <button onClick={() => setIsCartOpen(true)} className="pointer-events-auto flex items-center justify-between w-full max-w-[400px] bg-green-600 text-white p-3.5 rounded-2xl shadow-[0_8px_30px_rgba(34,197,94,0.3)] hover:bg-green-700 transition-transform active:scale-[0.98] border border-green-500">
              <div className="flex items-center pl-2">
                <span className="font-extrabold text-[15px] uppercase tracking-wide opacity-90">{cartTotalItems} ITEM{cartTotalItems > 1 ? "S" : ""}</span>
              </div>
              <div className="flex items-center gap-2 pr-2 font-bold text-[15px]">
                View Cart <ShoppingBag className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        {/* ── Sheets & Modals ── */}
        <CartSheet 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          menuItems={menu?.items || []}
          onIncrement={(id) => updateQuantity(id, 1)}
          onDecrement={(id) => updateQuantity(id, -1)}
        />
        <ItemDetailsSheet 
          item={selectedDetailsItem}
          isOpen={!!selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
        />
      </div>
    </>
  );
}
