import { Scanner } from "@yudiel/react-qr-scanner";

const QRScanner = ({ onScan }) => {
  const handleScan = (result) => {
    if (result && result.length > 0) {
      try {
        const decodedData = JSON.parse(result[0].rawValue);
        onScan(decodedData);
      } catch (error) {
        onScan(result[0].rawValue);
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <Scanner
        onScan={handleScan}
        onError={handleError}
        options={{
          delay: 500, // Optional delay to prevent rapid scanning
        }}
      />
    </div>
  );
};

export default QRScanner;
