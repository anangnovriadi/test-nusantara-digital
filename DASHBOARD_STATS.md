# Dashboard - Employee Statistics

## Overview
Halaman Dashboard telah ditingkatkan dengan menampilkan 2 card statistik karyawan yang informatif dan menarik secara visual.

## Features
- **Card Total Karyawan**: Menampilkan jumlah total karyawan yang terdaftar di sistem
- **Card Posisi Tersedia**: Menampilkan jumlah posisi unik dan daftar 5 posisi teratas
- **Responsive Design**: Kedua card ditampilkan bersebelahan (grid 2 kolom) di desktop, dan stack vertical di mobile
- **Loading States**: Menampilkan skeleton loading saat data sedang diambil
- **Premium UI**: Menggunakan icon dengan background berwarna dan badge untuk posisi

## Backend Implementation

### API Endpoints
Base URL: `/employees`

#### Get Employee Statistics
- **Endpoint**: `GET /employees/stats`
- **Auth**: Required (JWT)
- **Response**:
```json
{
  "data": {
    "totalEmployees": 100,
    "positions": [
      "Software Engineer",
      "Sales Executive",
      "Manager",
      "HR Specialist",
      "Accountant"
    ]
  }
}
```

### Files Modified/Created (Backend)
1. `src/employees/employees.controller.ts` - Added `/employees/stats` endpoint
2. `src/employees/employees.service.ts` - Added `getStats()` method

### Implementation Details (Backend)
- **Controller**: Menambahkan endpoint `@Get('stats')` yang memanggil service `getStats()`
- **Service**: Method `getStats()` melakukan:
  1. Fetch semua employee dari database
  2. Hitung total employees
  3. Extract unique positions menggunakan `Set`
  4. Return object dengan `totalEmployees` dan `positions`

## Frontend Implementation

### Pages
- **Route**: `/admin` (Dashboard)
- **File**: `src/app/admin/page.tsx`

### Features
- 2 Card statistics ditampilkan dalam grid
- **Card 1 - Total Karyawan**:
  - Icon Users dengan background biru
  - Menampilkan angka besar (text-4xl) untuk total
  - Subtitle informatif
  
- **Card 2 - Posisi Tersedia**:
  - Icon Briefcase dengan background hijau
  - Menampilkan jumlah posisi unik
  - List 5 posisi teratas dalam bentuk badge
  - Badge "+X lainnya" jika ada lebih dari 5 posisi

### Files Modified/Created (Frontend)
1. `src/app/admin/page.tsx` - Updated dashboard dengan statistics cards
2. `src/store/api/employee-api.ts` - Added `getEmployeeStats` endpoint

### UI Components Used
- **Card** - Container untuk statistik
- **CardHeader** - Header dengan title dan icon
- **CardContent** - Content area untuk data
- **Icons** - Users, Briefcase, Loader2
- **Badge** - Untuk menampilkan list posisi

### Styling
- Responsive grid: `grid-cols-1 md:grid-cols-2`
- Icon backgrounds: `bg-blue-100 dark:bg-blue-900/30` untuk total karyawan
- Icon backgrounds: `bg-green-100 dark:bg-green-900/30` untuk posisi
- Position badges: `bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full`
- Gap between cards: `gap-6`

## Data Flow
1. User membuka dashboard `/admin`
2. Component auto-fetch data menggunakan `useGetEmployeeStatsQuery()`
3. RTK Query memanggil endpoint `GET /employees/stats`
4. Backend menghitung total dan unique positions
5. Data ditampilkan di 2 card dengan loading state

## How to Use
1. Login ke aplikasi
2. Akan otomatis diarahkan ke Dashboard atau klik menu "Dashboard"
3. Lihat statistik di 2 card:
   - **Total Karyawan**: Menampilkan jumlah total karyawan
   - **Posisi Tersedia**: Menampilkan jumlah posisi unik dan list 5 teratas

## Design Highlights
- **Color Coding**: 
  - Blue untuk Total Karyawan (stability, trust)
  - Green untuk Posisi (growth, opportunity)
- **Large Numbers**: Text-4xl untuk angka statistik (easy to read)
- **Icon Badges**: Circular background untuk visual hierarchy
- **Position Tags**: Rounded pill badges untuk modern look
- **Dark Mode Support**: Semua warna memiliki dark mode variant

## Benefits
- **Quick Overview**: User langsung melihat statistik penting
- **Visual Appeal**: Card design yang menarik dan modern
- **Informative**: Menampilkan data yang relevan untuk decision making
- **Performance**: Efisien dengan single API call menggunakan RTK Query cache
