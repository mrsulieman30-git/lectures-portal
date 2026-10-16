import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        university_id: '',
        student_id_no: '',
        semester: '',
        year: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="role" value="Role" />
                    <select
                        id="role"
                        name="role"
                        value={data.role}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        onChange={(e) => setData('role', e.target.value)}
                        required
                    >
                        <option value="student">Student</option>
                        <option value="university">University</option>
                    </select>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                {data.role === 'student' && (
                    <>
                        <div className="mt-4">
                            <InputLabel htmlFor="university_id" value="University ID" />
                            <TextInput
                                id="university_id"
                                name="university_id"
                                value={data.university_id}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('university_id', e.target.value)}
                            />
                            <InputError message={errors.university_id} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="student_id_no" value="Student ID Number" />
                            <TextInput
                                id="student_id_no"
                                name="student_id_no"
                                value={data.student_id_no}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('student_id_no', e.target.value)}
                            />
                            <InputError message={errors.student_id_no} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="semester" value="Semester" />
                            <TextInput
                                id="semester"
                                name="semester"
                                value={data.semester}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('semester', e.target.value)}
                            />
                            <InputError message={errors.semester} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="year" value="Year" />
                            <TextInput
                                id="year"
                                name="year"
                                value={data.year}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('year', e.target.value)}
                            />
                            <InputError message={errors.year} className="mt-2" />
                        </div>
                    </>
                )}

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
