import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { createLabSchema, type CreateLabFormData } from '@/schemas/lab.schema';
import { useOrderLab } from '@/hooks/useLabs';
import { usePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/LoadingSpinner';

const OrderLabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const mutation = useOrderLab(id!);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateLabFormData>({
    resolver: zodResolver(createLabSchema),
    defaultValues: { location: 'Home', dateOrdered: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = (data: CreateLabFormData) => {
    mutation.mutate(data, { onSuccess: () => navigate(`/patients/${id}`) });
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}><ArrowLeft size={18} /></Button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">Order Lab Test</h1>
          {patient && <p className="text-sm text-text-secondary">{patient.firstName} {patient.lastName}</p>}
        </div>
      </div>

      <Card padding="lg">
        <CardHeader><CardTitle>Lab Test Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input label="Test Name" placeholder="e.g. Complete Blood Count" error={errors.testName?.message} {...register('testName')} />
            <Input label="Date Ordered" type="date" error={errors.dateOrdered?.message} {...register('dateOrdered')} />
            <Select label="Location" options={[{ value: 'Home', label: 'Home' }, { value: 'Hospital', label: 'Hospital' }]} error={errors.location?.message} {...register('location')} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>Cancel</Button>
              <Button type="submit" loading={mutation.isPending}>Order Lab Test</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderLabPage;
