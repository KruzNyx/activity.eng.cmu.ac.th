import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(data => {
        if (!data) router.replace("/login");
        else setMe(data);
        setCheckedAuth(true);
      })
      .catch(() => {
        router.replace("/login");
        setCheckedAuth(true);
      });
  }, [router]);

  return { me, checkedAuth };
}