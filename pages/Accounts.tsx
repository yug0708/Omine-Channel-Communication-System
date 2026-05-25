<table className="min-w-full">
  <thead className="border-b border-slate-200 dark:border-slate-800">
    <tr>
      <th scope="col" className="px-4 py-3">
        <input
          type="checkbox"
          className={checkboxClasses}
          onChange={handleSelectAll}
          checked={
            selectedAccounts.length === paginatedAccounts.length &&
            paginatedAccounts.length > 0
          }
        />
      </th>

      <TableHeader hasFilter>Account Name</TableHeader>
      <TableHeader>Website</TableHeader>
      <TableHeader>Email</TableHeader>
      <TableHeader hasFilter>Phone Number</TableHeader>
      <TableHeader>Address</TableHeader>
      <TableHeader>CR Number</TableHeader>
      <TableHeader>Assigned To</TableHeader>
      <TableHeader hasFilter>Country</TableHeader>
      <TableHeader hasFilter>Created Date</TableHeader>
      <TableHeader hasFilter>Updated Date</TableHeader>
      <TableHeader>Actions</TableHeader>
    </tr>
  </thead>

  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
    {paginatedAccounts.map((account) => {
      const {
        date: createdDate,
        time: createdTime
      } = formatDate(account.createdAt);

      const {
        date: updatedDate,
        time: updatedTime
      } = formatDate(account.updatedAt);

      const isSelected = selectedAccounts.includes(account.id);

      return (
        <tr
          key={account.id}
          className={`${
            isSelected ? 'bg-primary-500/10' : ''
          } hover:bg-slate-50 dark:hover:bg-slate-900/50`}
        >
          <td className="px-4 py-2">
            <input
              type="checkbox"
              className={checkboxClasses}
              checked={isSelected}
              onChange={() => handleSelectOne(account.id)}
            />
          </td>

          <td className="px-4 py-2 whitespace-nowrap">
            <div className="flex items-center space-x-3">
              <AccountAvatar name={account.name} />

              <span className="font-medium text-sm text-slate-900 dark:text-white">
                {account.name}
              </span>
            </div>
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.website}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.email}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.phone}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.address}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.crNumber}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.assignedTo}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
            {account.country}
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">
            <div>{createdDate}</div>

            <div className="text-xs text-slate-400">
              {createdTime}
            </div>
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">
            <div>{updatedDate}</div>

            <div className="text-xs text-slate-400">
              {updatedTime}
            </div>
          </td>

          <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleOpenModal(account)}
                className="text-slate-400 hover:text-emerald-500 p-1"
                aria-label={`Edit ${account.name}`}
              >
                <EditIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="text-slate-400 hover:text-red-500 p-1"
                aria-label={`Delete ${account.name}`}
              >
                <DeleteIcon className="h-5 w-5" />
              </button>
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

export default Accounts;
