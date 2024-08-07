import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DogRegister() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Dog Registration</h2>
      <form className="space-y-4">
        <div>
          <Label htmlFor="dogName">Dog Name</Label>
          <Input id="dogName" placeholder="Enter dog's name" />
        </div>
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input id="breed" placeholder="Enter dog's breed" />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" placeholder="Enter dog's age" />
        </div>
        <Button type="submit">Register Dog</Button>
      </form>
    </div>
  )
}