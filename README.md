# Bookshelvd

**A Letterboxd-inspired book logging application for readers.**

Bookshelvd is a social book logging platform that allows readers to track their reading journey, rate books, and build a personalized library. Originally developed as a school project, it has been updated to provide a more robust experience with accurate historical metadata and a sleek, intuitive interface.

### 🌐 Live Deployment
**[https://bookshelved-c5988.web.app/](https://bookshelved-c5988.web.app/)**

---

## 📖 User Manual

### 1. Finding Books
Use the **Search** bar in the header to find any book. The search is powered by the Google Books API and provides a comprehensive list of titles, authors, and covers.

### 2. Tracking Your Reading
Every book cover in the app features an interactive overlay. Hover over a cover to see the action icons:
- **👁️ Log (Visibility):** Mark a book as read. This opens a modal where you can set your rating (1-5 stars), write a review, and select the date you finished reading.
- **❤️ Like (Favorite):** Add a book to your favorites list.
- **🕒 TBR (Clock):** Add a book to your "To-Be-Read" list to save it for later.

### 3. Managing Your Library
Navigate to the **Logged Books** page to see your entire reading history. 
- **Sorting:** You can sort your library by **Date Logged**, **Original Release Date**, **Your Rating**, or **Book Length (Page Count)**.
- **Filtering:** Use the sorting options to group books by rating or identify books missing specific info.

### 4. Book Details
Click any book cover to visit its **Detail Page**. Here you can find:
- **Original Publication Year:** Unlike many platforms that only show the edition year, Bookshelvd integrates with Open Library to show when a work was first published.
- **Full Description:** Read the complete synopsis of the book.
- **Personal Review:** View your own rating, like status, and written review in one place.

---

## 🛠️ Technical Overview
- **Frontend:** React (TypeScript) with Vanilla CSS for a custom, responsive UI.
- **Database & Auth:** Firebase Firestore and Firebase Authentication.
- **APIs:** 
  - **Google Books API:** Primary source for book volumes, covers, and descriptions.
  - **Open Library API:** Secondary source used to verify and retrieve accurate original publication dates.
- **Testing:** Comprehensive unit testing suite using Jest and React Testing Library.

---

*Inspired by Letterboxd. Created by Kate Galvin.*
