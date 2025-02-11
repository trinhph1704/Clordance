import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RevenuePage.css';
import api from '../../utils/requestAPI';

const RevenuePage = () => {
  const { id } = useParams();
  const [studio, setStudio] = useState([]);
  const [users, setUsers] = useState({}); 

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const response = await api.get(`/Get-All-Order-Success-By-StudioId?studioId=${id}`);
        console.log('API data:', response.data);
        const extractedStudio = response.data?.$values || [];
        setStudio(extractedStudio);
      } catch (error) {
        console.error('Error fetching studio data:', error);
      }
    };

    fetchStudio();
  }, [id]);

  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueAccountIds = [...new Set(studio.map(item => item.booking?.accountId).filter(Boolean))]; 

      const userRequests = uniqueAccountIds.map(async (accountId) => {
        try {
          const response = await api.get(`/api/Account/get-by-id?accountId=${accountId}`);
          console.log('API data:', response.data);
          return { accountId, userData: response.data };
        } catch (error) {
          console.error(`Error fetching user ${accountId}:`, error);
          return null;
        }
      });

      const userData = await Promise.all(userRequests);
      const userMap = userData.reduce((acc, item) => {
        if (item) acc[item.accountId] = item.userData;
        return acc;
      }, {});

      setUsers(userMap);
    };

    if (studio.length > 0) {
      fetchUsers();
    }
  }, [studio]); // Chạy khi studio thay đổi

  const totalRevenue = studio.reduce((total, item) => {
    const priceValue = item.booking?.totalPrice;
    const price = typeof priceValue === "string"
      ? parseFloat(priceValue.replace(/[^0-9.]/g, ""))
      : typeof priceValue === "number"
      ? priceValue
      : 0;

    return total + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <div>
      <table className="custom-table">
        <thead>
          <tr className="table-header">
            <th>ID</th>
            <th>Customer Name</th>
            <th>Account Email</th>
            <th>Date</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {studio.map((item) => (
            <tr key={item.id} className="table-row">
              <td>{item.id}</td>
              <td>{users[item.booking?.accountId]?.userName || "N/A"}</td>
              <td>{users[item.booking?.accountId]?.email || "N/A"}</td> 
              <td>{new Date(item.orderDate).toLocaleDateString()}</td>
              <td>{item.booking?.totalPrice}</td>
              <td className='status-vui'>
                <div className='status-reven'>
                  {item.status ? "Success" : "Failed"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-revenue">
        <strong>Total Revenue: {totalRevenue.toFixed(2)}VND</strong>
      </div>
    </div>
  );
};

export default RevenuePage;
