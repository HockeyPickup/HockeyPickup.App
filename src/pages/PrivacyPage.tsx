/* eslint-disable react/no-unescaped-entities */
import { Container, Stack, Text, Title } from '@mantine/core';
import { JSX, useEffect } from 'react';
import { useTitle } from '../layouts/TitleContext';

export const PrivacyPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();

  useEffect(() => {
    setPageInfo('Privacy', 'Hockey Pickup Privacy');
  }, [setPageInfo]);

  return (
    <Container size='md' py='sm' ml='sm' mr='sm' mb='sm'>
      <Stack gap='md'>
        <Title order={1}>Privacy Policy</Title>
        <Text>
          Our Policy: Welcome to the web site (the "Site") of Pickup Hockey ("Pickup Hockey", "we",
          "us" and/or "our"). This Site is operated by Pickup Hockey and has been created to provide
          information about our company and the services we offer to our Service visitors and users
          ("you", "your"). This Privacy Policy sets forth our policy with respect to information
          including personally identifiable data ("Personal Data") and other information that is
          collected from visitors to the Site and Services.
          <br />
          <br />
          Information We Collect: When you interact with us through the Services, we may collect
          Personal Data and other information from you, as further described below:
          <br />
          <br />
          Personal Data That You Provide Through the Services: We collect Personal Data from you
          when you voluntarily provide such information, such as when you sign up for our mailing
          list or contact us with inquiries.
          <br />
          <br />
          By voluntarily providing us with Personal Data, you are consenting to our use of it in
          accordance with this Privacy Policy. If you provide Personal Data to the Services, you
          acknowledge and agree that such Personal Data may be transferred from your current
          location to the offices and servers of Pickup Hockey and the authorized third parties
          referred to herein located in the United States.
          <br />
          <br />
          Other Information:
          <br />
          <br />
          Non-Identifiable Data: When you interact with Pickup Hockey through the Services, we
          receive and store certain personally non-identifiable information. We may store such
          information itself or such information may be included in databases owned and maintained
          by Pickup Hockey's affiliates, agents or service providers. The Services may use such
          information and pool it with other information to track, for example, the total number of
          visitors to our Site, the number of visitors to each page of our Site, and the domain
          names of our visitors' Internet service providers.
          <br />
          <br />
          In operating the Services, we may use a technology called "cookies." A cookie is a piece
          of information that the computer that hosts our Services gives to your browser when you
          access the Services. Our cookies help provide additional functionality to the Services and
          help us analyze Services usage more accurately. For instance, our Site may set a cookie on
          your browser that allows you to access the Services without needing to remember and then
          enter a password more than once during a visit to the Site. On most web browsers, you will
          find a "help" section on the toolbar. Please refer to this section for information on how
          to receive notification when you are receiving a new cookie and how to turn cookies off.
          We recommend that you leave cookies turned on because they allow you to take advantage of
          some of the Service features.
          <br />
          <br />
          Aggregated Personal Data: In an ongoing effort to better understand and serve the users of
          the Services, we often conduct research on its customer demographics, interests and
          behavior based on the Personal Data and other information provided to us. This research
          may be compiled and analyzed on an aggregated and/or de-identified basis, and we may share
          this aggregated and/or de-identified data with its affiliates, agents and business
          partners. We may also disclose aggregated and/or de-identified user statistics and other
          metrics related to our Services in order to describe our products or services to current
          and prospective business partners and to other third parties for other lawful purposes.
          <br />
          <br />
          Analytics and Tracking Technologies: We may, and we may allow third party service
          providers to, use cookies (as noted above) or other tracking technologies to collect
          information about your browsing activities over time and across different websites
          following your use of the Site. For example, we use Google Analytics, a web analytics
          service provided by Google, Inc. ("Google"). Google Analytics uses cookies to help us
          analyze how users use the Site and enhance your experience when you use the Site. For more
          information on how Google uses this data, go to&nbsp;
          <a href='https://www.google.com/policies/privacy/partners/'>
            https://www.google.com/policies/privacy/partners/
          </a>
          .
          <br />
          <br />
          Our Site currently does not respond to "Do Not Track" (DNT) signals and operates as
          described in this Privacy Policy whether or not a DNT signal is received. If we do so in
          the future, we will describe how we do so in this Privacy Policy.
          <br />
          <br />
          Our Use of Your Personal Data and Other Information: We use the Personal Data you provide
          in a manner that is consistent with this Privacy Policy. If you provide Personal Data for
          a certain reason, we may use the Personal Data in connection with the reason for which it
          was provided. For instance, if you contact us by email, we will use the Personal Data you
          provide to answer your question or resolve your problem. Also, if you provide Personal
          Data in order to obtain access to the Services, we will use your Personal Data to provide
          you with access to such services and to monitor your use of such services. Pickup Hockey
          and its subsidiaries and affiliates (the "Related Companies") may also use your Personal
          Data and other personally non-identifiable information collected through the Services to
          help us improve the content and functionality of the Services, to better understand our
          users and to improve the Services. Pickup Hockey and its affiliates may use this
          information to contact you in the future to tell you about services we believe will be of
          interest to you. If we do so, each marketing communication we send you will contain
          instructions permitting you to "opt-out" of receiving future marketing communications. In
          addition, if at any time you wish not to receive any future marketing communications or
          you wish to have your name deleted from our mailing lists, please contact us as indicated
          below.
          <br />
          <br />
          Certain other ways we may use your Personal Data are as follows: – To administer a survey,
          promotion or other Service feature. – To allow us to better respond to your requests. – To
          troubleshoot problems with the Services. – To enforce our Terms of Use (see above), and to
          detect and protect against error, fraud and other unauthorized or illegal activities. – To
          provide any legitimate business service or product.
          <br />
          <br />
          Our Disclosure of Your Personal Data and Other Information: Pickup Hockey is not in the
          business of selling your Personal Data. There are, however, certain circumstances in which
          we may share your Personal Data with certain third parties without further notice to you,
          as set forth below:
          <br />
          <br />
          Business Transfers: As we develop our business, we might sell or buy businesses or assets.
          In the event of a corporate sale, merger, reorganization, dissolution or similar event,
          Personal Data may be part of the transferred assets.
          <br />
          <br />
          Related Companies: We may also share your Personal Data with our Related Companies for
          purposes consistent with this Privacy Policy.
          <br />
          <br />
          Agents, Consultants and Related Third Parties: We, like many businesses, sometimes hires
          other companies to perform certain business-related functions. Examples of such functions
          include mailing information, maintaining databases and processing payments. When we employ
          another entity to perform a function of this nature, we only provide them with the
          information that they need to perform their specific function.
          <br />
          <br />
          Legal Requirements: We may disclose your Personal Data if required to do so by law or in
          the good faith belief that such action is necessary to (i) comply with a legal obligation,
          (ii) protect and defend the rights or property of Pickup Hockey, (iii) act in urgent
          circumstances to protect the personal safety of users of the Services or the public, or
          (iv) protect against legal liability.
          <br />
          <br />
          Your Choices: You can visit the Site without providing any Personal Data. If you choose
          not to provide any Personal Data, you may not be able to use certain Services.
          <br />
          <br />
          Deletion of Data: Upon request, your data will be deleted from our Database. Please
          contact us via email to have your data removed: pickup@hockeypickup.com
          <br />
          <br />
          Exclusions: This Privacy Policy does not apply to any Personal Data collected by us other
          than Personal Data collected through the Services. This Privacy Policy shall not apply to
          any unsolicited information you provide to us through the Services or through any other
          means. This includes, but is not limited to, information posted to any public areas of the
          Services, such as forums, any ideas for new products or modifications to existing
          products, and other unsolicited submissions (collectively, "Unsolicited Information"). All
          Unsolicited Information shall be deemed to be non-confidential and we shall be free to
          reproduce, use, disclose, and distribute such Unsolicited Information to others without
          limitation or attribution.
          <br />
          <br />
          Children: We do not knowingly collect Personal Data from children under the age of 13. If
          you are under the age of 13, please do not submit any Personal Data through the Services.
          We encourage parents and legal guardians to monitor their children's Internet usage and to
          help enforce our Privacy Policy by instructing their children never to provide Personal
          Data on the Services without their permission. If you have reason to believe that a child
          under the age of 13 has provided Personal Data to us through the Services, please contact
          us, and we will endeavor to delete that information from our databases.
          <br />
          <br />
          Links to Other Web Sites: This Privacy Policy applies only to the Services. The Services
          may contain links to other web sites not operated or controlled by us (the "Third Party
          Sites"). The policies and procedures we described here do not apply to the Third Party
          Sites. The links from the Services do not imply that Pickup Hockey endorses or has
          reviewed the Third Party Sites. We suggest contacting those sites directly for information
          on their privacy policies.
          <br />
          <br />
          Security: We take commercially reasonable steps to protect the Personal Data provided via
          the Services from loss, misuse, and unauthorized access, disclosure, alteration, or
          destruction. However, no Internet or email transmission is ever fully secure or error
          free. In particular, email sent to or from the Services may not be secure. Therefore, you
          should take special care in deciding what information you send to us via email. Please
          keep this in mind when disclosing any Personal Data to us via the Internet.
          <br />
          <br />
          Changes to This Privacy Policy: The Services and our business may change from time to
          time. As a result, at times it may be necessary for us to make changes to this Privacy
          Policy. We reserve the right to update or modify this Privacy Policy at any time and from
          time to time without prior notice. Please review this policy periodically, and especially
          before you provide any Personal Data. This Privacy Policy was last updated on the date
          indicated above. Your continued use of the Services after any changes or revisions to this
          Privacy Policy shall indicate your agreement with the terms of such revised Privacy
          Policy.
          <br />
          <br />
          Access to Information; Contacting Us: To keep your Personal Data accurate, current, and
          complete, please contact us as specified below. We will take reasonable steps to update or
          correct Personal Data in our possession that you have previously submitted via the
          Services. Please also feel free to contact us if you have any questions about our Privacy
          Policy or the information practices of the Services.
          <br />
          <br />
          You may contact us at&nbsp;
          <a href='https://app.hockeypickup.com/about'>https://app.hockeypickup.com/about</a>, or at
          the following address:
          <br />
          <br />
          Pickup Hockey, 1187 Coast Village Road, STE 1-311, Montecito, California, 93108, USA
          <br />
          <br />
          Last Updated: 04/04/2022
        </Text>
      </Stack>
    </Container>
  );
};
