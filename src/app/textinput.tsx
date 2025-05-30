"use client"
import axios from "axios";
import { useState, FormEvent } from 'react';
type Props = {

  };

export default function TextInput({ }: Props) {  
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        
        
        const data = new FormData(event.currentTarget);
        const response = await axios.post("/api/upload", data, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
      }
  
    return (
      <form onSubmit={onSubmit}>
        <textarea name="xxxx"
        />
        <button>あああ</button>
      </form>
    );
  }
