UPDATE equipment SET image_url = CASE name
  WHEN 'Compresseur Atlas Copco GA30' THEN 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80'
  WHEN 'Pompe centrifuge Grundfos' THEN 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80'
  WHEN 'Convoyeur à bande principal' THEN 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80'
  WHEN 'Groupe électrogène Caterpillar' THEN 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80'
  WHEN 'Tour CNC Mazak' THEN 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80'
  WHEN 'Chaudière industrielle Viessmann' THEN 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80'
  WHEN 'Robot soudeur KUKA' THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
  WHEN 'Climatisation Daikin' THEN 'https://images.unsplash.com/photo-1631545806609-cb3c8f5c4f87?w=800&q=80'
END
WHERE name IN ('Compresseur Atlas Copco GA30','Pompe centrifuge Grundfos','Convoyeur à bande principal','Groupe électrogène Caterpillar','Tour CNC Mazak','Chaudière industrielle Viessmann','Robot soudeur KUKA','Climatisation Daikin');