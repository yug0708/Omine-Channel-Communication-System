
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Account } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, FilterFunnelIcon, MoreVertIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ImportIcon, ExportIcon } from '../components/icons/Icons';
import CountryCodePicker from '../components/ui/CountryCodePicker';
import { COUNTRIES as countries } from '../data/countries';

const AccountForm: React.FC<{
  account?: Account | null;
  onSave: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}> = ({ account, onSave, onClose }) => {
  const { currentUser } = useAuth();
  const assignedToName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';

  const parsePhoneNumber = (fullNumber: string | undefined) => {
    if (!fullNumber) {
      return { countryCode: 'IN', number: '' };
    }
    const matchingCountry = countries
      .filter(c => fullNumber.startsWith(c.dial_code))
      .sort((a, b) => b.dial_code.length - a.dial_code.length)[0];

    if (matchingCountry) {
      return {
        countryCode: matchingCountry.code,
        number: fullNumber.substring(matchingCountry.dial_code.length).trim(),
      };
    }
    // Fallback for numbers without a code, e.g., from old data
    return { countryCode: 'IN', number: fullNumber };
  };

  const initialPhone = parsePhoneNumber(account?.phone);

  const [formData, setFormData] = useState({
    name: account?.name || '',
    email: account?.email || '',
    city: account?.city || '',
    country: account?.country || '',
    crNumber: account?.crNumber || '',
    pincode: account?.pincode || '',
    website: account?.website || '',
    address: account?.address || '',
    assignedTo: account ? account.assignedTo : assignedToName,
  });

  const [phoneCountryCode, setPhoneCountryCode] = useState(initialPhone.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCountry = countries.find(c => c.code === phoneCountryCode);
    const fullPhoneNumber = selectedCountry ? `${selectedCountry.dial_code} ${phoneNumber}` : phoneNumber;
    onSave({ ...formData, phone: fullPhoneNumber });
  };

  const inputClass = "block w-full px-3 py-2.5 rounded-md bg-white dark:bg-dark-bg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-accent-green focus:border-accent-green text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className={labelClass}>Account Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="Account Name" />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="Email" />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <div className="flex mt-1">
            <CountryCodePicker value={phoneCountryCode} onChange={setPhoneCountryCode} />
            <input type="tel" name="phone" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className={`${inputClass} rounded-l-none border-l-0`} placeholder="Enter Phone Number" />
          </div>
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>City</label>
          <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="City" />
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>Country</label>
          <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="Country" />
        </div>

        <div>
          <label htmlFor="crNumber" className={labelClass}>CR Number</label>
          <input type="text" name="crNumber" id="crNumber" value={formData.crNumber} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="CR Number" />
        </div>

        <div>
          <label htmlFor="pincode" className={labelClass}>Pincode</label>
          <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="Pincode" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="website" className={labelClass}>Website</label>
          <input type="text" name="website" id="website" value={formData.website} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="Website" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className={labelClass}>Address</label>
          <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className={`mt-1 ${inputClass}`} placeholder="Address" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="assignedTo" className={labelClass}>Assigned to</label>
          <input type="text" name="assignedTo" id="assignedTo" value={formData.assignedTo} readOnly className={`mt-1 ${inputClass} bg-slate-100 dark:bg-dark-card cursor-default`} />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="outline" type="submit">Save</Button>
      </div>
    </form>
  );
};


const Accounts: React.FC = () => {
  const { accounts, setAccounts } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenModal = (account: Account | null = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleSaveAccount = (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAccount) {
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...editingAccount, ...accountData, updatedAt: new Date().toISOString() } : acc));
    } else {
      const newAccount: Account = {
        ...accountData,
        id: `acc${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAccounts([...accounts, newAccount]);
    }
    handleCloseModal();
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  }

  const handleExportClick = () => {
    if (accounts.length === 0) {
      alert("No accounts to export.");
      return;
    }

    const headers = Object.keys(accounts[0]);
    const csvContent = [
      headers.join(','),
      ...accounts.map(row =>
        headers.map(fieldName =>
          JSON.stringify(row[fieldName as keyof Account])
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "accounts.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsActionsMenuOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsActionsMenuOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) throw new Error("CSV must have a header and at least one data row.");

        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const importedAccounts: Account[] = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const accountData: any = {};
          headers.forEach((header, index) => {
            let value = (values[index] || '').trim().replace(/^"|"$/g, '');
            accountData[header] = value;
          });

          if (accountData.id && accountData.name && accountData.email) {
            importedAccounts.push(accountData as Account);
          }
        }

        setAccounts(prevAccounts => {
          const accountMap = new Map(prevAccounts.map(acc => [acc.id, acc]));
          importedAccounts.forEach(newAcc => {
            accountMap.set(newAcc.id, { ...accountMap.get(newAcc.id), ...newAcc });
          });
          return Array.from(accountMap.values());
        });
        alert(`${importedAccounts.length} accounts imported/updated successfully.`);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Failed to import accounts. Please check the file format.");
      }
    };
    reader.readAsText(file);
    if (event.target) {
      event.target.value = '';
    }
  };

  const filteredAccounts = useMemo(() => accounts.filter(account =>
    Object.values(account).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [accounts, searchTerm]);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAccounts.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAccounts, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredAccounts.length);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAccounts(paginatedAccounts.map(acc => acc.id));
    } else {
      setSelectedAccounts([]);
    }
  };
  const handleSelectOne = (id: string) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(accId => accId !== id) : [...prev, id]
    );
  };

  const AccountAvatar: React.FC<{ name: string }> = ({ name }) => (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white font-semibold text-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  );

  const formatDate = (isoString: string) => {
    if (!isoString || isNaN(new Date(isoString).getTime())) {
      return { date: 'Invalid Date', time: '' };
    }
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    return { date: `${day}/${month}/${year}`, time: time };
  };

  const TableHeader: React.FC<{ children: React.ReactNode; hasFilter?: boolean }> = ({ children, hasFilter }) => (
    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {hasFilter && <FilterFunnelIcon className="h-4 w-4" />}
      </div>
    </th>
  );

  const checkboxClasses = "h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 checked:bg-primary-500 checked:dark:bg-primary-500 focus:ring-primary-500";


  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
        aria-hidden="true"
      />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Accounts</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Account
        </Button>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500 text-sm"
              aria-label="Search accounts"
            />
          </div>
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={() => setIsActionsMenuOpen(prev => !prev)}
              className="p-2 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card"
              aria-label="More actions"
              aria-haspopup="true"
              aria-expanded={isActionsMenuOpen}
            >
              <MoreVertIcon className="h-5 w-5" />
            </button>
            {isActionsMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 p-1 text-slate-700 dark:text-slate-300">
                <button onClick={handleImportClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                  <ImportIcon className="h-5 w-5" />
                  <span>Import</span>
                </button>
                <button onClick={handleExportClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                  <ExportIcon className="h-5 w-5" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3">
                  <input type="checkbox" className={checkboxClasses} onChange={handleSelectAll} checked={selectedAccounts.length === paginatedAccounts.length && paginatedAccounts.length > 0} />
                </th>
                <TableHeader hasFilter>Account Name</TableHeader>
                <TableHeader>Website</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader hasFilter>Phone Number</TableHeader>
                <TableHeader>Address</TableHeader>
                <TableHeader>CR Number</TableHeader>
                <TableHeader>Assigned to</TableHeader>
                <TableHeader hasFilter>Created Date</TableHeader>
                <TableHeader>Updated Date</TableHeader>
                <TableHeader hasFilter>Country</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedAccounts.map((account) => {
                const { date: createdDate, time: createdTime } = formatDate(account.createdAt);
                const { date: updatedDate, time: updatedTime } = formatDate(account.updatedAt);
                const isSelected = selectedAccounts.includes(account.id);

                return (
                  <tr key={account.id} className={`${isSelected ? 'bg-primary-500/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-900/50`}>
                    <td className="px-4 py-2"><input type="checkbox" className={checkboxClasses} checked={isSelected} onChange={() => handleSelectOne(account.id)} /></td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <AccountAvatar name={account.name} />
                        <span className="font-medium text-sm text-slate-900 dark:text-white">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.website}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.phone}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.address}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.crNumber}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.assignedTo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      <div>{createdDate}</div>
                      <div className="text-xs text-slate-400">{createdTime}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      <div>{updatedDate}</div>
                      <div className="text-xs text-slate-400">{updatedTime}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{account.country}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenModal(account)} className="text-slate-400 hover:text-primary-500 p-1" aria-label={`Edit ${account.name}`}><EditIcon className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteAccount(account.id)} className="text-slate-400 hover:text-red-500 p-1" aria-label={`Delete ${account.name}`}><DeleteIcon className="h-5 w-5" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-end items-center text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span>Row Per page</span>
              <div className="relative">
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="appearance-none bg-transparent focus:outline-none focus:ring-0 pr-6">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDownIcon className="h-4 w-4 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span>{startIndex + 1}-{endIndex} of {filteredAccounts.length}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAccount ? 'Edit Account' : 'Create Account'}>
        <AccountForm account={editingAccount} onSave={handleSaveAccount} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Accounts;
