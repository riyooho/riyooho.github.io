import React from 'react'
import Holidays from 'date-holidays'
import "./date_holidays.scss"
import { Doctitles } from "../../config"

const DHoliday = () => {
    Doctitles("Notion Widget - HoliDate | @riyooho")
    const today = new Date("2022-12-25");
    const todayDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const todayDayName = today.toLocaleString('id-ID', {weekday: 'long'});
    const todayMonthName = today.toLocaleString('id-ID', {month: 'long'});
    const todayDayNumber = today.toLocaleString('id-ID', {day: '2-digit'})
    const todayYearNumber = today.toLocaleString('id-ID', {year: 'numeric'})
    const hd = new Holidays('ID');
    const holiday = hd.isHoliday(todayDate)
    return (
        <div style={{maxWidth: "430px"}}>
            <div className='widget'>
                <div className='todaySidebar'>
                    {todayDayNumber}
                </div>
                <div className='todayMain'>     
                        <m1>{todayDayName}</m1>
                        <m2>{todayMonthName} {todayYearNumber}</m2>
                </div>
            </div>
                {
                    holiday === false ? <p></p> : 
                    <span className='holidayFooter'>
                    {holiday[0].name}
                    </span>
                } 
        </div>
    )
}

export default DHoliday
