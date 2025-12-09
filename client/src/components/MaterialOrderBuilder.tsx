import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Download, Mail, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface MaterialOrderBuilderProps {
  jobId: number;
  jobAddress: string;
}

interface Accessory {
  name: string;
  quantity: number;
}

export function MaterialOrderBuilder({ jobId, jobAddress }: MaterialOrderBuilderProps) {
  const [shingleColor, setShingleColor] = useState('');
  const [materialSystem, setMaterialSystem] = useState('GAF');
  const [roofComplexity, setRoofComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [newAccessoryName, setNewAccessoryName] = useState('');
  const [newAccessoryQty, setNewAccessoryQty] = useState(1);

  const { data: existingOrders, refetch } = trpc.crm.getMaterialOrders.useQuery({ jobId });

  const generateOrder = trpc.crm.generateBeaconOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Order ${data.order.orderNumber} created successfully!`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddAccessory = () => {
    if (!newAccessoryName.trim()) {
      toast.error('Please enter accessory name');
      return;
    }
    setAccessories([...accessories, { name: newAccessoryName, quantity: newAccessoryQty }]);
    setNewAccessoryName('');
    setNewAccessoryQty(1);
  };

  const handleRemoveAccessory = (index: number) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  const handleGenerateOrder = () => {
    if (!shingleColor.trim()) {
      toast.error('Please select a shingle color');
      return;
    }

    generateOrder.mutate({
      jobId,
      shingleColor,
      materialSystem,
      roofComplexity,
      accessories: accessories.length > 0 ? accessories : undefined,
    });
  };

  const handleDownloadCSV = (csvUrl: string) => {
    window.open(csvUrl, '_blank');
  };

  const handleSendToSupplier = (order: any) => {
    const subject = encodeURIComponent(`New Order: ${jobAddress}`);
    const body = encodeURIComponent(
      `Order Number: ${order.orderNumber}\n` +
      `Address: ${jobAddress}\n` +
      `Total Squares: ${order.totalSquares}\n\n` +
      `Please see attached CSV for complete order details.\n\n` +
      `CSV Download: ${order.csvUrl || 'Generating...'}`
    );
    const mailto = `mailto:sales@becn.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <div className="space-y-6">
      {/* Order Builder Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            Material Order Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step A: Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shingleColor" className="text-slate-300">
                Shingle Color *
              </Label>
              <Input
                id="shingleColor"
                value={shingleColor}
                onChange={(e) => setShingleColor(e.target.value)}
                placeholder="e.g., Charcoal"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialSystem" className="text-slate-300">
                Material System
              </Label>
              <Select value={materialSystem} onValueChange={setMaterialSystem}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="GAF" className="text-white hover:bg-slate-700">GAF</SelectItem>
                  <SelectItem value="Owens Corning" className="text-white hover:bg-slate-700">Owens Corning</SelectItem>
                  <SelectItem value="CertainTeed" className="text-white hover:bg-slate-700">CertainTeed</SelectItem>
                  <SelectItem value="Tamko" className="text-white hover:bg-slate-700">Tamko</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roofComplexity" className="text-slate-300">
                Roof Complexity
              </Label>
              <Select value={roofComplexity} onValueChange={(v: any) => setRoofComplexity(v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="simple" className="text-white hover:bg-slate-700">
                    Simple (7% waste)
                  </SelectItem>
                  <SelectItem value="moderate" className="text-white hover:bg-slate-700">
                    Moderate (12% waste)
                  </SelectItem>
                  <SelectItem value="complex" className="text-white hover:bg-slate-700">
                    Complex (17% waste)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accessories Section */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold">Manual Accessories</Label>
            <p className="text-xs text-slate-400">
              Add items that cannot be detected from aerial imagery (pipe boots, vents, etc.)
            </p>

            {/* Existing Accessories */}
            {accessories.length > 0 && (
              <div className="space-y-2">
                {accessories.map((acc, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-700 p-2 rounded">
                    <span className="text-white flex-1">{acc.name}</span>
                    <span className="text-slate-300">Qty: {acc.quantity}</span>
                    <Button
                      onClick={() => handleRemoveAccessory(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-slate-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Accessory Form */}
            <div className="flex gap-2">
              <Input
                value={newAccessoryName}
                onChange={(e) => setNewAccessoryName(e.target.value)}
                placeholder="Accessory name (e.g., Pipe Boot)"
                className="bg-slate-700 border-slate-600 text-white flex-1"
              />
              <Input
                type="number"
                value={newAccessoryQty}
                onChange={(e) => setNewAccessoryQty(Number(e.target.value))}
                min="1"
                className="bg-slate-700 border-slate-600 text-white w-20"
              />
              <Button
                onClick={handleAddAccessory}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateOrder}
            disabled={generateOrder.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {generateOrder.isPending ? 'Generating...' : 'Generate Material Order'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Orders */}
      {existingOrders && existingOrders.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Previous Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingOrders.map((order) => (
              <div key={order.id} className="bg-slate-700 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.totalSquares} squares
                    </p>
                    <p className="text-sm text-slate-300">
                      {order.shingleColor} • {order.materialSystem}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.csvUrl && (
                      <Button
                        onClick={() => handleDownloadCSV(order.csvUrl!)}
                        variant="outline"
                        size="sm"
                        className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSendToSupplier(order)}
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 border-blue-500 text-white hover:bg-blue-500"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                {/* Line Items Preview */}
                {order.lineItems && (
                  <div className="text-sm space-y-1">
                    {(order.lineItems as any[]).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{item.productName}</span>
                        <span>{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                    {(order.lineItems as any[]).length > 3 && (
                      <p className="text-slate-400 text-xs">
                        +{(order.lineItems as any[]).length - 3} more items
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
