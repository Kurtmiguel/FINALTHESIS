"use client";

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react'

export default function DogRegister() {
  const [image, setImage] = useState<File | null>(null)
  const [hasCollar, setHasCollar] = useState<boolean>(false)
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData()

    formData.append('dogName', (form.dogName as HTMLInputElement).value)
    formData.append('breed', (form.breed as HTMLInputElement).value)
    formData.append('age', (form.age as HTMLInputElement).value)
    formData.append('hasCollar', hasCollar.toString())

    if (image) {
      formData.append('image', image)
    }

    try {
      const response = await fetch('/api/register-dog', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        setAlertMessage('Dog registered successfully')
        setShowAlert(true)
        form.reset()
        setHasCollar(false)
        setImage(null)
      } else {
        setAlertMessage('Failed to register dog')
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setAlertMessage('An error occurred while registering the dog')
      setShowAlert(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-indigo-800 text-center">Dog Registration</h2>
        {showAlert && (
          <div className={`p-4 mb-6 text-sm rounded-lg ${alertMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
            {alertMessage}
            <button onClick={() => setShowAlert(false)} className="float-right font-bold">&times;</button>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="dogName" className="block text-sm font-medium text-gray-700 mb-1">Dog Name</label>
            <input id="dogName" name="dogName" placeholder="Enter dog's name" required 
                   className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" />
          </div>
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <input id="breed" name="breed" placeholder="Enter dog's breed" required 
                   className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input id="age" name="age" type="number" placeholder="Enter dog's age" required 
                   className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out" />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Dog Image</label>
            <input 
              ref={fileInputRef}
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              >
                Choose File
              </button>
              <span className="text-sm text-gray-500">
                {image ? image.name : 'No file chosen'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasCollar"
              checked={hasCollar}
              onChange={(e) => setHasCollar(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="hasCollar" className="text-sm font-medium text-gray-700">
              Dog has a collar
            </label>
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
            Register Dog
          </button>
        </form>
      </div>
    </div>
  )

}