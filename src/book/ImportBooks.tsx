import React, { useState, useEffect, useRef } from 'react';

export const ImportBooks: React.FC<{}> = () => {
  const fileInput = useRef() as React.MutableRefObject<HTMLInputElement>;
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const files = fileInput.current?.files;
    if (files === null) {
      console.log('failed to get file.');
      return;
    }
    const file = files[0];
    console.log(file);

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      console.log(reader.result);
    };
    reader.onerror = () => {
      console.log('failed to read file.');
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" ref={fileInput} />
      <button type="submit">Submit</button>
    </form>
  );
};
