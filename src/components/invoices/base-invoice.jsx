import React, { forwardRef } from "react";
// import EvolvLogo from "../../assets/images/evolv-logo.png";
import moment from "moment";

// Helper function to pad numbers
const padToSixDigits = (number) => {
  return number ? number.toString().padStart(6, "0") : "000000";
};

const BaseInvoice = forwardRef(
  (
    {
      invoiceNumber,
      invoiceDate,
      clientName,
      clientPhone,
      clientEmail,
      clientAddress,
      companyName,
      companyTagline,
      invoiceItems,
      totalAmount,
      currency,
      bankDetails,
      contactPhone,
      contactWebsite,
      contactEmail,
    },
    ref,
  ) => {
    const amount = Number(totalAmount || 0).toFixed(2);
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));

    return (
      <div
        ref={ref}
        style={{
          width: "100%", // Responsive width for screen
          maxWidth: "800px", // Standard A4 width approx
          minHeight: "1123px", // A4 height
          backgroundColor: "white",
          padding: "40px", // Reduced padding for better screen fit
          margin: "0 auto",
          position: "relative",
          fontFamily: "Arial, sans-serif",
        }}
        className="print:w-full print:max-w-none print:p-[40px] print:shadow-none shadow-lg"
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "48px", // Slightly smaller for screen
              fontWeight: "bold",
              margin: 0,
              color: "#333",
            }}
          >
            INVOICE
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                textAlign: "right",
                marginRight: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  color: "#4f46e5", // Indigo-600
                }}
              >
                {companyName}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  maxWidth: "300px",
                  lineHeight: 1.4,
                  margin: 0,
                  color: "#666",
                }}
              >
                {companyTagline}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Logo Placeholder or Prop */}
              <div className="h-16 w-16 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
                {companyName?.[0] || "C"}
              </div>
            </div>
          </div>
        </div>

        <hr
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#e5e7eb",
            margin: "0 0 40px 0",
          }}
        />

        {/* Invoice Info Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "60px",
          }}
        >
          {/* Client Info */}
          <div
            style={{
              width: "50%",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Invoice To
            </p>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#111827",
              }}
            >
              {clientName}
            </h3>
            <div
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#4b5563",
              }}
            >
              <p style={{ margin: "0 0 5px 0" }}>{clientPhone}</p>
              <p style={{ margin: "0 0 5px 0" }}>{clientEmail}</p>
              {Array.isArray(clientAddress) &&
                clientAddress.map((line, index) => (
                  <p key={index} style={{ margin: "0 0 5px 0" }}>
                    {line}
                  </p>
                ))}
              {!Array.isArray(clientAddress) && <p>{clientAddress}</p>}
            </div>
          </div>

          {/* Total Section */}
          <div
            style={{
              textAlign: "right",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Due
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: "#4f46e5",
              }}
            >
              {currency} {formattedAmount}
            </p>
            <p
              style={{
                fontSize: "14px",
                marginBottom: "5px",
                color: "#4b5563",
              }}
            >
              No:{" "}
              <span className="font-medium text-gray-900">
                {padToSixDigits(Number(invoiceNumber))}
              </span>
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#4b5563",
              }}
            >
              Date:{" "}
              <span className="font-medium text-gray-900">
                {moment(invoiceDate).format("DD MMM, YYYY")}
              </span>
            </p>
          </div>
        </div>

        {/* Service Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "60px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Description
              </th>
              <th
                style={{
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                  textAlign: "right",
                  padding: "12px 16px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems?.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    padding: "16px",
                    fontSize: "14px",
                    color: "#1f2937",
                  }}
                >
                  {item.description}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    padding: "16px",
                    fontSize: "14px",
                    textAlign: "right",
                    color: "#1f2937",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                  }).format(item.amount)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                style={{
                  textAlign: "right",
                  padding: "16px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                Total
              </td>
              <td
                style={{
                  textAlign: "right",
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#111827",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                {formattedAmount}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment Method Section */}
        <div
          style={{
            //   position: "absolute",
            //   bottom: 150,
            //   marginBottom: "60px",
            marginTop: "auto",
            paddingTop: "40px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#111827",
              textDecoration: "underline",
              textDecorationColor: "#e5e7eb",
              textUnderlineOffset: "4px",
            }}
          >
            Payment Details
          </h3>
          <div
            style={{
              fontSize: "14px",
              lineHeight: 1.8,
              color: "#4b5563",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "8px",
              }}
            >
              <span style={{ color: "#6b7280" }}>Bank Name:</span>
              <span style={{ fontWeight: 500, color: "#111827" }}>
                {bankDetails?.bankName}
              </span>

              <span style={{ color: "#6b7280" }}>Account Title:</span>
              <span style={{ fontWeight: 500, color: "#111827" }}>
                {bankDetails?.accountTitle}
              </span>

              <span style={{ color: "#6b7280" }}>Account No:</span>
              <span
                style={{
                  fontWeight: 500,
                  color: "#111827",
                  fontFamily: "monospace",
                }}
              >
                {bankDetails?.accountNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "60px",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          <div>{contactPhone}</div>
          <div>{contactWebsite}</div>
          <div>{contactEmail}</div>
        </div>
      </div>
    );
  },
);

BaseInvoice.displayName = "BaseInvoice";

export default BaseInvoice;
