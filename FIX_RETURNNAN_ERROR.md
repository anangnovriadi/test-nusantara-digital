# Fix Production Build Errors

## Errors Encountered

### 1. `returnNaN is not defined`
```
⨯ [ReferenceError: returnNaN is not defined]
```

### 2. `num.toFixed is not a function`
```
TypeError: num.toFixed is not a function
```

## Root Cause

**MySQL DECIMAL Type Returns String!**

The backend uses:
```typescript
@Column('decimal', { precision: 12, scale: 2 })
salary: number;
```

MySQL DECIMAL values are returned as **strings** by the MySQL driver to preserve precision. This causes:

1. **Frontend receives:** `{ salary: "50000.00" }` (string)
2. **TypeScript expects:** `{ salary: 50000 }` (number)
3. **When calling:** `num.toFixed(2)` → Error! Strings don't have `.toFixed()`

## Complete Solution

### Backend Fix (TypeORM Transformer)

**File:** `employee-api/src/employees/employee.entity.ts`

```typescript
@Column('decimal', { 
  precision: 12, 
  scale: 2,
  transformer: {
    to: (value: number) => value,           // Save as number
    from: (value: string) => parseFloat(value)  // Convert string to number
  }
})
salary: number;
```

This **automatically converts** DECIMAL strings to numbers when retrieving from database.

### Frontend Fix (Defensive Programming)

**File:** `employee-fe/src/app/admin/employees/page.tsx`

```typescript
const convertToRupiah = (num: number | string) => {
  // Convert to number if string (defensive)
  const value = typeof num === 'string' ? parseFloat(num) : num;
  
  // Handle NaN, null, undefined, or invalid values
  if (value == null || isNaN(value)) {
    return "Rp.0,00";
  }
  
  return "Rp." + value
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&.")
    .replace(".", ",");
};
```

This handles **both types** (string and number) as fallback.

## Why Both Fixes?

1. **Backend transformer** = Primary fix (converts at source)
2. **Frontend type handling** = Defensive coding (handles edge cases)

This ensures reliability in both development and production.

## How to Apply

### Backend
```bash
cd employee-api

# No rebuild needed for entity changes
# Just restart the dev server (Ctrl+C then npm run start:dev)
```

### Frontend
```bash
cd employee-fe

# Clear cache and rebuild
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build

# Or just restart dev server
npm run dev
```

## Verification

After fix, check:

1. **No TypeScript errors** in console
2. **Salary displays correctly** as "Rp.15.000.000,00"
3. **No runtime errors** in browser console
4. **Production build succeeds** without errors

## Related Files Changed

1. ✅ `employee-api/src/employees/employee.entity.ts` - Added transformer
2. ✅ `employee-fe/src/app/admin/employees/page.tsx` - Enhanced convertToRupiah

## Lessons Learned

1. **MySQL DECIMAL → String** in JavaScript (precision preservation)
2. **Always use transformers** for numeric types in TypeORM
3. **Defensive type handling** in frontend for type safety
4. **Test production builds** before deploying

--- 

**Both errors should now be fixed!** 🎉

