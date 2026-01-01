import { FC, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from "next/link";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginCredentials } from '@/store/api/auth-api';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface Props {
  onSubmit: (v: LoginCredentials) => void,
  isLoading: boolean
}

const LoginForm: FC<Props> = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
   });

   const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: onSubmit,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Masuk ke Akun Anda</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda untuk masuk ke akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="me@example.com"
                    className={`${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    className={`${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={isLoading} className="cursor-pointer">
                  {isLoading ? <Loader2 className="animate-spin size-5" /> : 'Login'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm;
