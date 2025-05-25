export interface RealState {
  id?: number;               
  name: string;              
  description: string;       
  rooms: number;             
  bathrooms: number;         
  price: number;             
  locationId: number;        
  categoryId: number;        
  publishDate: string;       
  status?: 'available' | 'sold' | 'reserved'; // Estado de la propiedad
  sellerId?: number;
}