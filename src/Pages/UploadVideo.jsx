import React, { useState } from 'react';

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [folderName, setFolderName] = useState('');
  // Функція обробки події вибору файлу
  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  // Функція обробки події відправки форми
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Створюємо FormData-об'єкт для відправки файлу на сервер
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderName', folderName);

      // Відправляємо POST-запит на сервер за допомогою fetch API
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      // Парсимо відповідь сервера
      const data = await response.json();

      // Оновлюємо повідомлення про статус вивантаження
      setMessage(data);
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileSelect} />
        <label>
          назва папки
          <input
            type="text"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
            }}
          />
        </label>
        <button type="submit">Upload</button>
      </form>
      {message && (
        <>
          <p>{message.message}</p>{' '}
          <a href={`${message.link}`}>{message.link}</a>
        </>
      )}
    </div>
  );
};

export default UploadVideo;
