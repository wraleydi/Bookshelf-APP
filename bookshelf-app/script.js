document.addEventListener('DOMContentLoaded', function() {
    const submitApp = document.getElementById('inputBook');
    submitApp.addEventListener('submit', function(ev) {
        ev.preventDefault();
        bookAdd();
    });

    const books = [];
    const EVENT_RENDER = 'render-book';
    const EVENT_SAVED = 'saved-book';
    const EVENT_ADDSAVED = 'add-book';
    const KEY = 'BOOKSHELF';

    function bookAdd() {
        const bookTitle = document.getElementById('inputBookTitle').value;
        const bookAuthor = document.getElementById('inputBookAuthor').value;
        const bookYear = parseInt(document.getElementById('inputBookYear').value);
        const bookId = generateId();
        const isCompleted = document.getElementById('inputBookIsComplete').checked;

        const isBookObject = bookObject(bookId, bookTitle, bookAuthor, bookYear, isCompleted);
        books.push(isBookObject);

        document.dispatchEvent(new Event(EVENT_RENDER));
        addSaved();
    }

    document.addEventListener(EVENT_RENDER, function() {
        const inCompleted = document.getElementById('incompleteBookshelfList');
        inCompleted.innerHTML = '';

        const completed = document.getElementById('completeBookshelfList');
        completed.innerHTML = '';

        for (const item of books) {
            const bookElement = createBook(item);
            if (!item.isCompleted) {
                inCompleted.append(bookElement);
            } else {
                completed.append(bookElement);
            }
        }
    });

    document.addEventListener(EVENT_SAVED, function() {
        let message = 'Data has been saved!';
        let messageElement = document.createElement('div');
        messageElement.className = 'floating-message';
        messageElement.innerText = message;

        document.body.appendChild(messageElement);

        messageElement.offsetHeight; 
    
        messageElement.classList.add('show');

    setTimeout(() => {
        messageElement.classList.remove('show');
        messageElement.addEventListener('transitionend', () => {
            document.body.removeChild(messageElement);
        });
    }, 1500);

    });

    document.addEventListener(EVENT_ADDSAVED, function(){
        let message = 'has been added successfully';
        let messageElement = document.createElement('div');
        messageElement.className = 'floating-message';
        messageElement.innerText = message;

        document.body.appendChild(messageElement);

        messageElement.offsetHeight; 
    
        messageElement.classList.add('show');

    setTimeout(() => {
        messageElement.classList.remove('show');
        messageElement.addEventListener('transitionend', () => {
            document.body.removeChild(messageElement);
        });
    }, 1500);
    });

    function isStorageExist() {
        if (typeof(Storage) === undefined) {
            let message = 'Browser Anda tidak mendukung Local Storage';
            let messageElement = document.createElement('div');
            messageElement.className = 'storage-message';
            messageElement.innerText = message;

            document.body.appendChild(messageElement);
            messageElement.offsetHeight;
            messageElement.classList.add('show');
            return false;
        }
        let existingMessageElement = document.querySelector('.storage-message');
        if (existingMessageElement) {
            existingMessageElement.style.display = 'none';
        }

        return true;
    }

    function generateId() {
        return +new Date();
    }

    function bookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year,
            isComplete,
        };
    }

    function createBook(bookObject) {
        const textTitle = document.createElement('h3');
        textTitle.innerText = bookObject.title; 

        const textAuthor = document.createElement('p');
        textAuthor.innerText = `Penulis: ${bookObject.author}`; 

        const textYear = document.createElement('p');
        textYear.innerText = `Tahun: ${bookObject.year}`; 

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');

        const buttonComplete = document.createElement('button');
        buttonComplete.classList.add('green');
        buttonComplete.innerText = bookObject.isCompleted ? 'Belum selesai di Baca' : 'Selesai dibaca';
        buttonComplete.addEventListener('click', function() {
            toggleComplete(bookObject.id);
        });

        const buttonDelete = document.createElement('button');
        buttonDelete.classList.add('red');
        buttonDelete.innerText = 'Hapus buku';
        buttonDelete.addEventListener('click', function() {
            showConfirmDialog(bookObject.id);
        });

        actionContainer.append(buttonComplete, buttonDelete);

        const bookElement = document.createElement('article');
        bookElement.classList.add('book_item');
        bookElement.append(textTitle, textAuthor, textYear, actionContainer);

        return bookElement;
    }

    function findBook(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }

        return -1;
    }

    function toggleComplete(bookId) {
        const targetBook = findBook(bookId);
        if (targetBook == null) return;

        targetBook.isCompleted = !targetBook.isCompleted;

        document.dispatchEvent(new Event(EVENT_RENDER));
        saved();
    }

    function showConfirmDialog(bookId) {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.classList.add('dialog-overlay');

        const dialogBox = document.createElement('div');
        dialogBox.classList.add('dialog-box');

        const dialogText = document.createElement('p');
        dialogText.innerText = 'Apakah kamu yakin ingin menghapus buku ini?';

        const confirmButton = document.createElement('button');
        confirmButton.innerText = 'Ya';
        confirmButton.classList.add('dialog-button', 'confirm-button');

        const cancelButton = document.createElement('button');
        cancelButton.innerText = 'Batal';
        cancelButton.classList.add('dialog-button', 'cancel-button');

        confirmButton.addEventListener('click', function() {
            deleteBook(bookId);
            document.body.removeChild(dialogOverlay);
        });

        cancelButton.addEventListener('click', function() {
            document.body.removeChild(dialogOverlay);
        });

        dialogBox.appendChild(dialogText);
        dialogBox.appendChild(confirmButton);
        dialogBox.appendChild(cancelButton);
        dialogOverlay.appendChild(dialogBox);

        document.body.appendChild(dialogOverlay);
    }

    function deleteBook(bookId) {
        const targetBookIndex = findBookIndex(bookId);
        if (targetBookIndex === -1) return;

        books.splice(targetBookIndex, 1);
        document.dispatchEvent(new Event(EVENT_RENDER));
        saved();
    }

    function saved(){
        if (isStorageExist()){
            const data = JSON.stringify(books);
            localStorage.setItem(KEY, data);
            document.dispatchEvent(new Event(EVENT_SAVED));
        }
    }

    function addSaved(){
        if (isStorageExist()){
            const data = JSON.stringify(books);
            localStorage.setItem(KEY, data);
            document.dispatchEvent(new Event(EVENT_ADDSAVED));
        }
    }

    if (isStorageExist()) {
        loadStorage();
    }

    function loadStorage(){
        const serializedData = localStorage.getItem(KEY);
        const parse = JSON.parse(serializedData);

        if (parse !== null){
            for (const book of parse) {
                books.push(book);
            }
        }
        document.dispatchEvent(new Event(EVENT_RENDER));
    }

    const searchBook = document.getElementById('searchBook');
    searchBook.addEventListener('submit', function(ev){
        ev.preventDefault();
        isSearchBook();
    });

    function isSearchBook() {
        const titleSearch = document.getElementById('searchBookTitle').value.toLowerCase();
        const searchResults = books.filter(book => book.title.toLowerCase().includes(titleSearch));

        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsContainer.innerHTML = '';

        for (const item of searchResults) {
            const bookElement = createBook(item);
            searchResultsContainer.append(bookElement);
        }
    }
});