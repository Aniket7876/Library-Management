import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../layout/Header';

const Users = () => {
  const { users } = useSelector((state) => state.user);
  const formatDate = (timeStamp) => {
    const date = new Date(timeStamp);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(date.getFullYear())}`;

    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
      2,
      '0',
    )}:${String(date.getSeconds()).padStart(2, '0')}`;

    const result = `${formattedDate} ${formattedTime}`;
    return result;
  };

  return (
    <>
      <main className="relative flex-1 p-6 pt-28">
        <Header />
        <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">Registered Users</h2>
        </header>

        {/* Table */}
        {users && users.filter((u) => u.role === 'User').length > 0 ? (
          <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-center">No. of books borrowed</th>
                  <th className="px-4 py-2 text-center">Created At</th>
                </tr>
              </thead>

              <tbody>
                {users
                  .filter((u) => u.role === 'User')
                  .map((user, index) => (
                    <tr key={user._id} className={(index + 1) % 2 === 0 ? 'bg-gray-100' : ''}>
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2 text-center">{user?.borrowedBooks.length}</td>
                      <td className="px-4 py-2 text-center">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-3xl mt-5 font-medium">No registered user found in library.</h3>
        )}
      </main>
    </>
  );
};

export default Users;
