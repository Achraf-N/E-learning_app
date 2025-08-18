import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Vérification en cours...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Token manquant');
      return;
    }

    fetch(
      `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/verify-email?token=${token}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setMessage(data.message);
          setTimeout(() => {
            navigate('/Login'); // Redirige vers login après succès
          }, 3000);
        } else {
          setMessage('Erreur lors de la vérification');
        }
      })
      .catch(() => setMessage('Erreur réseau'));
  }, [searchParams, navigate]);

  return <div>{message}</div>;
};

export default VerifyEmail;
