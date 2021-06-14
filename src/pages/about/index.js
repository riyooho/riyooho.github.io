import React from 'react'
import { Card, Avatar, Row, Image, Divider, Typography, Space } from 'antd'
import { MailOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons';
import './about.scss'
import { AvaBg } from '../../assets'

const { Title } = Typography

const About = () => {
    return (
        <>
            <div className="box">
                <Card bordered={false} style={{ textAlign: "center", width: 350, backgroundColor: "#393e46", borderRadius: '25px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    <Space direction="vertical" size={30}>
                        <Row justify="center" className="avatar">
                            <Avatar size={150} bordered
                            src={<Image src={AvaBg} preview={false}/>}
                            />
                        </Row>
                        <Title level={3} style={{color: "beige"}}>
                            Wahyu Satrio Nugroho
                        </Title>
                    </Space>
                    <p className="beige">an environmentalist who loves coding</p><br/>
                    <Space size="middle">
                        <a className="link" href="mailto:riyonugroho@outlook.com"><MailOutlined  className="icon"/></a>
                        <a className="link" href="https://twitter.com/riyooho"><TwitterOutlined className="icon"/></a>
                        <a className="link" href="https://www.linkedin.com/in/wsnugroho"><LinkedinOutlined className="icon"/></a>
                    </Space>
                    {/* <Divider orientation="left" style={{borderColor: 'beige', color: 'beige'}}>My Project</Divider>
                    <a href=""><div className="button">📈 Stocks Dashboard</div></a> */}
                </Card>
                ©2021 Copyright @staticriou
            </div>
        </>
    )
}

export default About
