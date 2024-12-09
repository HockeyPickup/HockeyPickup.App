import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTitle } from '@/layouts/TitleContext';
import { Box, Container } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';

interface FlickrPhoto {
  id: string;
  farm: number;
  server: string;
  secret: string;
}

interface PhotoInfo {
  owner: { username: string };
  title: { _content: string };
  dates: { taken: string };
}

export const GamePucksPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle('Game Pucks');
  }, [setTitle]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = '80ce3a61ed9e788c8e4e31641582fc0a';
    const flickrAlbumId = '72177720312370541';
    const flickrUrl = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${flickrAlbumId}&format=json&nojsoncallback=1&sort=date-posted-desc`;

    const photoPromises: Promise<{
      photo: FlickrPhoto;
      photoInfo: PhotoInfo;
      createdDate: Date;
    }>[] = [];

    fetch(flickrUrl)
      .then((response) => response.json())
      .then((data) => {
        const photos = data.photoset.photo;

        photos.forEach((photo: FlickrPhoto) => {
          const flickrPhotoId = photo.id;
          const flickrPhotoInfoUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${flickrPhotoId}&format=json&nojsoncallback=1`;

          const photoPromise = fetch(flickrPhotoInfoUrl)
            .then((response) => response.json())
            .then((data) => {
              const photoInfo = data.photo;
              const createdDate = new Date(photoInfo.dates.taken);
              return { photo, photoInfo, createdDate };
            });

          photoPromises.push(photoPromise);
        });

        Promise.all(photoPromises).then((photoData) => {
          photoData.sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
          photoData.reverse();

          const flickrAlbum = document.getElementById('flickrAlbum');
          if (!flickrAlbum) return;

          for (const { photo, photoInfo } of photoData) {
            const owner = photoInfo.owner.username;
            const title = photoInfo.title._content;
            const imgUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;

            const aElement = document.createElement('a');
            aElement.href = `https://www.flickr.com/photos/${owner}/${photo.id}`;
            aElement.target = '_blank';

            const imgElement = document.createElement('img');
            imgElement.src = imgUrl;

            const captionElement = document.createElement('p');
            captionElement.textContent = title;

            aElement.appendChild(imgElement);
            aElement.appendChild(captionElement);

            flickrAlbum.appendChild(aElement);

            setIsLoading(false);
          }
        });
      });
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Container>
      {isLoading && <LoadingSpinner />}
      <Box>
        <div
          id='flickrAlbum'
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            maxWidth: '1200px',
            margin: '20px auto',
          }}
        />
        <style>
          {`
            #flickrAlbum a,
            #flickrAlbum a:link,
            #flickrAlbum a:visited,
            #flickrAlbum a:hover,
            #flickrAlbum a:active {
              flex: 0 0 auto;
              width: 100%; /* Changed from calc(33.33% - 10px) to 100% */
              max-width: 600px; /* Added max-width for larger screens */
              min-width: auto; /* Changed from 300px to auto */
              text-decoration: none !important;
              color: inherit;
              transition: transform 0.2s ease-in-out;
              border-bottom: none !important;
              outline: none !important;
            }

            @media (min-width: 768px) {
              #flickrAlbum a,
              #flickrAlbum a:link,
              #flickrAlbum a:visited,
              #flickrAlbum a:hover,
              #flickrAlbum a:active {
                width: calc(33.33% - 10px);
                min-width: 300px;
              }
            }
            #flickrAlbum a:hover {
              transform: translateY(-2px);
            }
            #flickrAlbum img {
              width: 100%;
              height: auto;
              objectFit: cover;
              marginBottom: 2px;
              borderRadius: 4px;
            }
            #flickrAlbum p {
              margin: 0;
              fontSize: 12px;
              color: #666;
            }
          `}
        </style>{' '}
      </Box>
    </Container>
  );
};
