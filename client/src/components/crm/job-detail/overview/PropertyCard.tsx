import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Job } from "@/types";

interface PropertyCardProps {
  job: Job;
}

export function PropertyCard({ job }: PropertyCardProps) {
  const hasCoordinates = job.latitude && job.longitude;
  const mapUrl = hasCoordinates
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${job.latitude},${job.longitude}&zoom=18&size=400x200&maptype=satellite&markers=color:red%7C${job.latitude},${job.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || "AIzaSyA7QSM-fqUn4grHM6OYddNgKzK7uMlBY1I"}`
    : null;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-400" />
          Property
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">Address</p>
          <p className="font-medium text-white">{job.address}</p>
          <p className="text-slate-300">{job.cityStateZip}</p>
        </div>

        {hasCoordinates && mapUrl && (
          <div>
            <p className="text-sm text-slate-400 mb-2">Location</p>
            <a
              href={`https://www.google.com/maps?q=${job.latitude},${job.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden border-2 border-slate-700 hover:border-[#00d4aa] transition-colors"
            >
              <img
                src={mapUrl}
                alt="Property location"
                className="w-full h-32 object-cover"
              />
            </a>
            <p className="text-xs text-slate-500 mt-1">
              📍 {Number(job.latitude).toFixed(6)}, {Number(job.longitude).toFixed(6)}
            </p>
          </div>
        )}

        {!hasCoordinates && (
          <p className="text-xs text-slate-500">
            ⚠️ Location coordinates not set
          </p>
        )}
      </CardContent>
    </Card>
  );
}
