import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() { const { register, handleSubmit, formState: { errors } } = useForm(); const submit = () => toast('Authentication is pending backend implementation.', { icon: 'ℹ️' }); return <section className="mx-auto max-w-md surface p-6"><h1 className="page-title">Sign in</h1><p className="mt-2 text-sm text-amber-200">Authentication is not yet supported by the C++ backend. This form does not send or store credentials.</p><form className="mt-6 space-y-4" onSubmit={handleSubmit(submit)}><Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} /><Input id="password" label="Password" type="password" error={errors.password?.message} {...register('password', { required: 'Password is required' })} /><Button className="w-full" type="submit">Sign in (integration pending)</Button></form><p className="mt-5 text-sm text-slate-400">Need an account? <Link className="text-blue" to="/register">Register</Link></p></section>; }
