import { app } from './app.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dadrxwiks',
  api_key: '932998694248929',
  api_secret: 'L7no1Psc_AV8PL9HiaOehLezgME',
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
