import React, { useState, ChangeEvent, FormEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DogRegister() {
  const [image, setImage] = useState<File | null>(null)
  const [hasCollar, setHasCollar] = useState<boolean>(false)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData()

    // Append form field data
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
        console.log('Dog registered successfully')
        // Reset form or show success message
      } else {
        console.error('Failed to register dog')
        // Show error message
      }
    } catch (error) {
      console.error('Error:', error)
      // Show error message
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Dog Registration</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="dogName">Dog Name</Label>
          <Input id="dogName" name="dogName" placeholder="Enter dog's name" required />
        </div>
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input id="breed" name="breed" placeholder="Enter dog's breed" required />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" placeholder="Enter dog's age" required />
        </div>
        <div>
          <Label htmlFor="image">Dog Image</Label>
          <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasCollar"
            checked={hasCollar}
            onChange={(e) => setHasCollar(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="hasCollar" className="text-sm font-medium text-gray-700">
            Dog has a collar
          </Label>
        </div>
        <Button type="submit">Register Dog</Button>
      </form>
    </div>
  )
}