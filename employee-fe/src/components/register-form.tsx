import { FC, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterCredentials } from '@/store/api/auth-api';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface Props {
  onSubmit: (v: RegisterCredentials) => void;
  isLoading: boolean;
}

const RegisterForm: FC<Props> = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Alamat email tidak valid')
      .required('Email wajib diisi'),
    password: Yup.string()
      .min(6, 'Password minimal 6 karakter')
      .required('Password wajib diisi'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Konfirmasi password tidak cocok')
      .required('Konfirmasi password wajib diisi'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: onSubmit,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Akun Baru</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk mendaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-5">
              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  className={formik.touched.email && formik.errors.email ? 'border-red-500' : ''}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="text-sm text-red-500">{formik.errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password"
                    className={formik.touched.password && formik.errors.password ? 'border-red-500' : ''}
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
                {formik.touched.password && formik.errors.password && (
                  <span className="text-sm text-red-500">{formik.errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : ''}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <span className="text-sm text-red-500">{formik.errors.confirmPassword}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button disabled={isLoading} className="cursor-pointer">
                  {isLoading ? <Loader2 className="animate-spin size-5" /> : 'Daftar'}
                </Button>
                <div className="text-center">
                  <p className="text-sm">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-primary font-medium underline underline-offset-4">
                      Login di sini
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
