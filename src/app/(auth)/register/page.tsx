import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { RegisterForm} from '@/components/RegistrationForm'
import { Header } from '@/components/Header'

const UserRegister: React.FC = () => {
  const methods = useForm()

  return (
    <div>
      <Header />
      <main className="p-4">
        <h2 className="text-xl font-bold mb-4">User Registration</h2>
        <FormProvider {...methods}>
          <RegisterForm />
        </FormProvider>
      </main>
    </div>
  )
}

export default UserRegister
