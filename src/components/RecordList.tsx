'use client'

import React, { useState } from 'react';
import { Search, MoreVertical, Trash2 } from 'lucide-react';
import { DogData, UserData } from '@/lib/adminUtils';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecordListProps {
  owners: UserData[];
  dogs: DogData[];
}

const RecordList: React.FC<RecordListProps> = ({ owners, dogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'owners' | 'dogs'>('owners');
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; type: 'owner' | 'dog'; id: string }>({ isOpen: false, type: 'owner', id: '' });

  const filteredOwners = owners.filter(owner =>
    owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDogs = dogs.filter(dog =>
    dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owners.find(owner => owner._id === dog.owner.toString())?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteAlert.type === 'owner') {
      console.log(`Deleting owner with ID: ${deleteAlert.id}`);
    } else {
      console.log(`Deleting dog with ID: ${deleteAlert.id}`);
    }
    setDeleteAlert({ isOpen: false, type: 'owner', id: '' });
    // Implement actual deletion logic and data refresh here
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder={viewMode === 'owners' ? "Search owners..." : "Search dogs..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'owners' | 'dogs')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owners">Owner List</SelectItem>
            <SelectItem value="dogs">Dog List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        {viewMode === 'owners' ? 'Registered Owners' : 'Registered Dogs'}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {viewMode === 'owners' ? (
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            ) : (
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Collar Status</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {viewMode === 'owners' ? (
              filteredOwners.map((owner) => (
                <TableRow key={owner._id}>
                  <TableCell>{owner.fullName}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>{owner.contactNumber}</TableCell>
                  <TableCell>{owner.address}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDeleteAlert({ isOpen: true, type: 'owner', id: owner._id })}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredDogs.map((dog) => (
                <TableRow key={dog._id.toString()}>
                  <TableCell>{dog.name}</TableCell>
                  <TableCell>{dog.breed}</TableCell>
                  <TableCell>{dog.collarActivated ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>{owners.find(owner => owner._id === dog.owner.toString())?.fullName || 'Unknown'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDeleteAlert({ isOpen: true, type: 'dog', id: dog._id.toString() })}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteAlert.isOpen} onOpenChange={(isOpen) => setDeleteAlert({ ...deleteAlert, isOpen })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteAlert.type} record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecordList;