# Marketplace photographs

One photograph per item in `lib/marketplace.ts`, named after the item's id. The
card, the rails, the bento, the order rows and the supply table all read
`/market/<id>.webp`, so adding an item means adding a file with its name.

## Where they came from

All from [Unsplash](https://unsplash.com), under the [Unsplash
License](https://unsplash.com/license): free to use commercially and
non-commercially, no permission needed, no attribution required. Credited here
anyway, because a file with no provenance is a file nobody can re-license.

Fetched at 900×600 (`fit=crop`, `crop=entropy`), re-encoded to 720px-wide webp
at q78 — the whole set is under 700 KB.

| File | Source |
|---|---|
| `backpack.webp` | https://images.unsplash.com/photo-1553062407-98eeb64c6a62 |
| `canteen-200.webp` | https://images.unsplash.com/photo-1589778655375-3e622a9fc91c |
| `day-off.webp` | https://images.unsplash.com/photo-1565489494334-624acf9aff48 |
| `hoodie.webp` | https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77 |
| `late-start.webp` | https://images.unsplash.com/photo-1662038271111-5b1c0b4157e8 |
| `lunch.webp` | https://images.unsplash.com/photo-1574966739987-65e38db0f7ce |
| `meals.webp` | https://images.unsplash.com/photo-1542367592-8849eb950fd8 |
| `mug.webp` | https://images.unsplash.com/photo-1666445844615-0a3930270f13 |
| `night-meal.webp` | https://images.unsplash.com/photo-1602704436046-51278415e8eb |
| `notebook.webp` | https://images.unsplash.com/photo-1557752370-554e42f30a38 |
| `offsite-seat.webp` | https://images.unsplash.com/photo-1503423571797-2d2bb372094a |
| `phone-data.webp` | https://images.unsplash.com/photo-1564567913547-428a0fc38750 |
| `safety-boots.webp` | https://images.unsplash.com/photo-1520639888713-7851133b1ed0 |
| `stay.webp` | https://images.unsplash.com/photo-1618773928121-c32242e63f39 |
| `tee.webp` | https://images.unsplash.com/photo-1562157873-818bc0726f68 |
| `transport.webp` | https://images.unsplash.com/photo-1548604303-c001905b14fc |
| `trees.webp` | https://images.unsplash.com/photo-1625758476104-f2ed6c81248f |
| `v-any-10000.webp` | https://images.unsplash.com/photo-1549465220-1a8b9238cd48 |
| `v-food-500.webp` | https://images.unsplash.com/photo-1589010588553-46e8e7c21788 |
| `v-shop-1000.webp` | https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0 |
| `v-shop-5000.webp` | https://images.unsplash.com/photo-1483985988355-763728e1935b |
| `v-travel-2500.webp` | https://images.unsplash.com/photo-1582217900003-2b19c0e3a7d0 |

## Replacing one

    curl -s -o /tmp/x.jpg "https://images.unsplash.com/photo-<id>?w=900&h=600&fit=crop&crop=entropy&q=80&fm=jpg"
    cwebp -q 78 -resize 720 0 /tmp/x.jpg -o apps/product/public/market/<item-id>.webp

Then update the row above. Nothing else needs to change.
