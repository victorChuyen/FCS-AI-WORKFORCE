TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ
BA 1.5
HỆ THỐNG CRM QUẢN LÝ DATAVÀ TUYỂN DỤNG LAO ĐỘNG
TRẠNG THÁI TÀI LIỆUBản chuẩn hóa để Business Review và khóa yêu cầu trước Functional Specification / Database Design / Development.
Thuộc tính
Nội dung
Phiên bản
1.5
Ngày chuẩn hóa
15/09/2026
Phạm vi
Data – Tuyển dụng – Phỏng vấn – Đi làm – VEN/CTV – Hoa hồng – Thưởng – Audit – Báo cáo
Đối tượng
MKT – Sale – Lead – Manager – Hiện trường – Kế toán – Giám đốc – Admin
Nguồn chuẩn hóa
BA 1.4 + dữ liệu lao động FCS + chính sách mẫu WNC + các quyết định nghiệp vụ đã chốt
0. LỊCH SỬ THAY ĐỔI BA 1.5
Nhóm thay đổi
BA 1.5
Worker Profile
Chỉ giữ thông tin cố định của lao động; tách SĐT, địa chỉ, ngân hàng, người thân sang bảng riêng.
Recruitment
Mỗi lần ứng tuyển là 01 Recruitment Registration; chuẩn hóa master status theo file vận hành FCS.
VEN
Mốc thông thường hiện tại: 12.000đ × số giờ làm thực tế đủ điều kiện, tối đa 90 ngày; áp dụng theo Policy Version.
CTV
Mốc thông thường hiện tại: 500.000đ/người/mốc 26 công, tối đa 90 ngày; các mốc được cấu hình theo Policy.
Approval
Hoa hồng và trường hợp tài chính cần xét duyệt: Lead → Manager → Kế toán → Giám đốc.
Reward
Chính sách thưởng theo từng công ty/phiên bản/mốc; WNC dùng làm mẫu cấu trúc chuẩn.
Policy
Không hard-code tiền/mốc; chính sách thay đổi phải tạo version mới và snapshot giao dịch.
Data model
Tách Master Data, Worker Core, Recruitment/Employment Transaction, Financial Policy/Transaction.
I. MỤC ĐÍCH VÀ PHẠM VI
Xây dựng CRM tập trung quản lý toàn bộ vòng đời lao động từ Data ban đầu đến tuyển dụng, phỏng vấn, đi làm, theo dõi công/giờ, thưởng người lao động và hoa hồng VEN/CTV. Hệ thống phải bảo đảm dữ liệu không bị ghi đè lịch sử, xác định đúng nguồn/attribution, hỗ trợ chính sách thay đổi theo thời gian và có audit đầy đủ.
Không tạo trùng Worker Profile cho cùng một người.
Một Worker có thể có nhiều Recruitment Registration theo từng lần ứng tuyển.
Phân biệt rõ Data Origin, người tạo Data, Sale phụ trách và VEN/CTV giới thiệu.
Tách Worker Reward khỏi VEN/CTV Commission.
Chính sách tài chính được cấu hình theo Company/Period/Version, không hard-code.
Mọi thao tác quan trọng phải có lịch sử và Audit Log.
II. PHẠM VI MODULE
STT
Module
Phạm vi
01
User / Role / Permission
User, Role, Team, Office, Data Scope
02
Master Data
Company, Position, Office, Bank, Education, Geography, Data Source
03
Worker
Worker Profile và các bảng thông tin cá nhân thay đổi
04
Data & C3
MKT nhập Data, Sale tự tạo, kiểm tra trùng
05
Assignment
Sale nhận Data, khóa chống nhận trùng, reassignment
06
Recruitment
Recruitment Registration và state machine
07
Consultation
Lịch sử chăm sóc/tư vấn
08
Interview
Lịch hẹn, Sale report, Field confirmation
09
Employment
Đi làm, nghỉ, chuyển công ty
10
Attendance
Công/giờ theo kỳ làm căn cứ tài chính
11
VEN/CTV
Referral Source và Attribution
12
Commission
Policy, calculation, approval 4 cấp, payment
13
Worker Reward
Company Policy, milestone, worker reward, payment
14
Audit
Lịch sử thay đổi và phê duyệt
15
Dashboard/Report
Theo Sale/Team/Office/Company/Source/Finance
Ngoài phạm vi BA 1.5Quản lý xe, tài xế, tuyến đưa đón, điểm đón và điều phối đưa đón.
III. VAI TRÒ NGƯỜI DÙNG
Vai trò
Quyền chính
MKT
Nhập/quản lý Data MKT theo phạm vi.
Sale
Nhận Data, tự tạo Data, tư vấn, tạo lịch phỏng vấn, cập nhật nghiệp vụ trong phạm vi.
Lead
Quản lý Sale/team; duyệt cấp 1 các giao dịch hoa hồng/tình huống tài chính được cấu hình.
Manager
Quản lý Office/Area; duyệt cấp 2.
Hiện trường
Xác nhận phỏng vấn, ngày đi làm, trạng thái thực tế, dữ liệu hiện trường.
Kế toán
Kiểm tra số liệu, duyệt cấp 3, thực hiện/ghi nhận thanh toán.
Giám đốc
Duyệt cấp 4 và phê duyệt chính sách thưởng/tài chính theo phân quyền.
Admin/SYS_ADMIN
Quản trị master data, permission, policy configuration và hệ thống.
IV. NGUYÊN TẮC DỮ LIỆU CỐT LÕI
Nguyên tắc 01Một người lao động chỉ có 01 Worker Profile. Mọi lần tuyển dụng tiếp theo tạo Recruitment Registration mới.
Nguyên tắc 02Một field chỉ nằm trong worker_profile nếu thông tin đó vẫn đúng bất kể người lao động đang ứng tuyển công ty nào, do Sale nào phụ trách và ở lần tuyển dụng thứ mấy.
Nguyên tắc 03Thông tin có thể thay đổi theo thời gian (SĐT, địa chỉ, tài khoản ngân hàng, người thân) tách sang bảng riêng để giữ lịch sử.
Nguyên tắc 04Thông tin theo lần tuyển dụng/đi làm/tài chính tuyệt đối không đặt trong worker_profile.
V. WORKER PROFILE – BẢNG THÔNG TIN CỐ ĐỊNH
Field
Ý nghĩa
Ghi chú
worker_id
ID lao động
PK, hệ thống
worker_code
Mã lao động
Unique, hệ thống
full_name
Họ và tên
Bắt buộc
date_of_birth
Ngày sinh
Bắt buộc khi hoàn thiện hồ sơ
gender
Giới tính
Danh mục
identity_number
CCCD/CMTND
Định danh chính sau xác minh
identity_type
Loại giấy tờ
CCCD/CMTND
identity_issue_date
Ngày cấp
Theo giấy tờ
identity_issue_place
Nơi cấp
Theo giấy tờ
ethnicity
Dân tộc
Nếu có
birth_place
Nơi sinh
Theo giấy tờ/VNeID
hometown
Quê quán
Theo giấy tờ/VNeID
marital_status
Tình trạng hôn nhân
Danh mục
education_level_id
Trình độ học vấn
FK danh mục
graduated_school
Trường tốt nghiệp
Thông tin cá nhân
major
Chuyên ngành
Thông tin cá nhân
graduation_year
Năm tốt nghiệp
YYYY
social_insurance_number
Số BHXH
Nếu có
profile_status
Trạng thái hồ sơ
ACTIVE/INACTIVE/MERGED
created_at/by
Ngày/người tạo
Audit
updated_at/by
Ngày/người cập nhật
Audit
VI. CÁC BẢNG THÔNG TIN CÁ NHÂN TÁCH RIÊNG
Bảng
Nhóm dữ liệu
Trường chính
worker_phone
Số điện thoại
worker_phone_id, worker_id, phone_number, phone_type, is_primary, is_verified, effective_from, effective_to, status
worker_address
Địa chỉ
worker_address_id, worker_id, address_type, province_id, ward_id, address_detail, full_address, effective_from, effective_to, is_current
worker_bank_account
Tài khoản ngân hàng
worker_bank_account_id, worker_id, bank_id, account_number, account_name, is_primary, is_verified, effective_from, effective_to, status
worker_emergency_contact
Người liên hệ khẩn cấp
contact_id, worker_id, full_name, relationship_type_id, phone_number, address, is_primary, status
Số điện thoại được tách riêng vì là khóa check trùng ban đầu nhưng có thể thay đổi. Không được xóa số cũ; số cũ vẫn dùng để tìm kiếm, chống trùng và audit.
VII. MASTER DATA / DANH MỤC
Danh mục
Mục đích
company
Công ty tuyển dụng/đối tác
position
Vị trí tuyển dụng
office
Văn phòng
team
Team
province / ward
Địa lý
bank
Ngân hàng
education_level
Trình độ học vấn
relationship_type
Quan hệ người thân
data_source
Nguồn Data
recruitment_status
Mã trạng thái C3/L1/L2/L3/L4
working_status
Trạng thái đi làm
referral_type
VEN/CTV
payment_method
Tiền mặt/Tài khoản/...
policy_status
DRAFT/PENDING/ACTIVE/EXPIRED/...
VIII. DATA, NGUỒN VÀ ATTRIBUTION
Hệ thống phải phân biệt bốn khái niệm độc lập: Data Origin → Người tạo Data → Sale phụ trách → Người giới thiệu VEN/CTV. Không dùng một field duy nhất để thay thế bốn thông tin này.
Khái niệm
Lưu tại
Ý nghĩa
Data Origin
registration_source
Nguồn phát sinh Data: MKT, Sale Self, VEN, CTV, Facebook, TikTok...
Created By
registration / audit
User tạo dữ liệu trong hệ thống
Assigned Sale
registration_assignment
Sale chịu trách nhiệm tại một thời điểm
Referral Attribution
registration_attribution
VEN/CTV được hưởng quyền lợi cho Registration
IX. MKT NHẬP DATA / SALE TỰ TẠO
Giai đoạn
Field tối thiểu
MKT tạo C3
Họ tên, SĐT, Công ty tuyển, Nguồn Data, Ghi chú, Văn phòng; hệ thống tự ghi ngày/người tạo.
Sale tự tạo
Họ tên, SĐT, Công ty tuyển, Nguồn Data, Ghi chú, Văn phòng; hệ thống tự gán Sale phụ trách.
Sau kiểm tra trùng
Nếu là người mới → Worker + Registration; nếu đã có Worker → chỉ tạo Registration phù hợp.
Sale tự tạo Data không bắt buộc đi qua kho C3 nếu pass kiểm tra trùng và đủ điều kiện tạo Registration.
X. CHỐNG TRÙNG VÀ MERGE WORKER
Giai đoạn đầu: SĐT là khóa kiểm tra trùng chính.
Sau xác minh: CCCD là định danh chính thức.
Nếu CCCD thuộc hồ sơ khác: cảnh báo → xác minh → merge nếu cùng người → không xóa lịch sử → audit đầy đủ.
Merge phải giữ
Chi tiết
Recruitment
Tất cả Registration, Assignment, Consultation, Interview, Employment
Contact
Phone/Address/Bank/Emergency Contact history
Financial
Attribution, Reward, Commission, Payment
Audit
Old/New record, người thao tác, thời gian, lý do
XI. RECRUITMENT REGISTRATION
Field
Ý nghĩa
registration_id
PK
registration_code
Mã lần tuyển
worker_id
FK Worker
company_id
Công ty ứng tuyển
position_id
Vị trí
campaign_id
Chiến dịch nếu có
office_id
Văn phòng tuyển
assigned_sale_id
Sale hiện tại
registration_date
Ngày tạo
recruitment_status_id
Trạng thái
expected_start_date
Ngày dự kiến nhận việc
actual_start_date
Ngày đi làm thực tế
applied_reward_policy_id/version
Policy thưởng đã khóa
applied_commission_policy_id/version
Policy hoa hồng nếu có
note
Ghi chú
XII. MASTER STATUS TUYỂN DỤNG BA 1.5
Mã
Tên trạng thái
C3
Lao động mới
C3.1
Số trùng
C3.2
Số rác
L1
Số lao động chia cho Sale
L1.1
Tham khảo
L1.2
Chăm sóc lại
L1.3
Từ chối tiếp xúc / Không có nhu cầu
L1.4
TB, KNM, MB
L1.5
Thừa tuổi từ 45 tuổi trở lên
L1.6
Hẹn gọi lại
L1.7
Lao động thiếu tuổi
L2
Lao động hẹn phỏng vấn
L2.1
Lao động đỗ phỏng vấn
L2.2
Lao động trượt phỏng vấn
L2.3
Lao động hẹn không đến phỏng vấn
L3
Lao động đang đi làm
L3.1
Lao động nghỉ ngang
L3.2
Lao động muốn chuyển công ty khác
L4
Lao động hết thời gian tính phí
Quyết định BA 1.5Bộ trạng thái trên là master status dùng để đồng bộ BA, UI, import/export và báo cáo. Mọi thay đổi tên/mã phải quản lý qua master data/version, không để từng module tự định nghĩa.
XIII. STATE TRANSITION CỐT LÕI
From
To
Vai trò
Điều kiện
C3
L1
Sale
Nhận Data thành công
L1
L1.1–L1.7
Sale
Theo kết quả tư vấn
L1/L1.6
L2
Sale
Hẹn phỏng vấn
L2
L2.1/L2.2/L2.3
Sale/Field
Kết quả phải lưu nguồn cập nhật; Field confirmation là xác nhận thực tế
L2.1
L3
Field
Xác nhận bắt đầu đi làm
L3
L3.1
Field/authorized user
Nghỉ ngang
L3
L3.2
Field/authorized user
Muốn chuyển công ty
L3
L4
System/authorized user
Hết thời gian tính phí/hoa hồng theo Policy
XIV. PHỎNG VẤN – SALE REPORT VS FIELD CONFIRMATION
Không dùng một trạng thái đơn để Sale và Hiện trường ghi đè lẫn nhau. Hệ thống phải lưu tối thiểu sale_reported_status và field_confirmed_status cùng lịch sử cập nhật.
Quy tắc ưu tiênField Confirmed Status là kết quả thực tế chính thức cho các bước nghiệp vụ sau; Sale Report phục vụ chăm sóc, tracking và đối chiếu.
XV. EMPLOYMENT / ĐI LÀM
Field
Ý nghĩa
employment_id
PK
registration_id
FK Registration
company_id
Công ty thực tế
client_employee_code
Mã nhân viên tại công ty
start_date
Ngày đi làm thực tế
end_date
Ngày nghỉ
employment_status
Đang làm/Nghỉ/Chuyển...
termination_reason
Lý do nghỉ
commission_start_date
Bắt đầu thời gian hưởng
commission_end_date
Hết thời gian hưởng theo Policy
XVI. ATTENDANCE – DỮ LIỆU CÔNG/GIỜ
Số công và số giờ là dữ liệu biến động theo kỳ, không nằm trong Worker Profile. Đây là nguồn số liệu bắt buộc để tính VEN/CTV Commission và một số Worker Reward.
Field
Ý nghĩa
attendance_period_id
PK
employment_id
Employment
period_from / period_to
Kỳ công
actual_workdays
Công thực tế
actual_work_hours
Giờ thực tế
eligible_workdays
Công đủ điều kiện
eligible_work_hours
Giờ đủ điều kiện
source_file/reference
Nguồn bảng công
confirmed_by/at
Người/thời điểm xác nhận
status
DRAFT/CONFIRMED/LOCKED
XVII. VEN/CTV – REFERRAL SOURCE & ATTRIBUTION
Field
Ý nghĩa
referral_source_id
PK
referral_code
Mã VEN/CTV
referral_type
VEN/CTV
full_name
Họ tên
phone
SĐT
office_id
Văn phòng
status
ACTIVE/INACTIVE
default_policy_id
Policy mặc định nếu có
Attribution phải gắn theo Recruitment Registration. Một Worker quay lại lần 2 có thể có người giới thiệu khác với lần 1. Một Registration chỉ có 01 người hưởng hoa hồng giới thiệu tại cùng thời điểm theo rule đã khóa.
XVIII. COMMISSION POLICY – NGUYÊN TẮC
VEN và CTV có thể dùng cách tính khác nhau và thay đổi theo thời gian.
Policy có effective_from/effective_to và version; không sửa đè policy đã phát sinh giao dịch.
Mỗi Commission Transaction phải snapshot Policy, rate, số liệu công/giờ và số tiền tính tại thời điểm phát sinh.
Thời gian hưởng mặc định hiện tại: tối đa 90 ngày, nhưng vẫn là field cấu hình trong Policy.
XIX. CHÍNH SÁCH VEN – MỐC THÔNG THƯỜNG HIỆN TẠI
VEN DEFAULT POLICYMức tham chiếu hiện tại: 12.000 đồng × số giờ làm thực tế đủ điều kiện của lao động; được hưởng tối đa 90 ngày kể từ ngày bắt đầu đi làm thực tế của Registration, trừ khi Policy cụ thể quy định khác.
Thuộc tính
Giá trị mặc định hiện tại
referral_type
VEN
calculation_type
HOURLY
rate_amount
12.000 VND
rate_unit
HOUR
basis
eligible_work_hours
maximum_benefit_days
90
effective period
Theo Commission Policy Version
Công thức: VEN Commission = Eligible Work Hours × Rate của Policy Version đang áp dụng.
XX. CHÍNH SÁCH CTV – MỐC THÔNG THƯỜNG HIỆN TẠI
CTV DEFAULT POLICYMức tham chiếu hiện tại: 500.000 đồng/người/mốc 26 công; được hưởng tối đa 90 ngày. Việc có các mốc tiếp theo trong 90 ngày phải được cấu hình cụ thể trong Commission Policy, không mặc định phần mềm cứ đủ thêm 26 công là tự trả.
Thuộc tính
Giá trị mặc định hiện tại
referral_type
CTV
calculation_type
WORKDAY_MILESTONE
required_workdays
26 công / mốc
milestone_amount
500.000 VND
maximum_benefit_days
90
repeat/milestones
Theo Policy configuration
effective period
Theo Commission Policy Version
XXI. COMMISSION TRANSACTION
Field
Ý nghĩa
commission_transaction_id
PK
registration_id
Lần tuyển
worker_id
Worker
referral_source_id/type
VEN/CTV hưởng
commission_policy_id/version
Policy snapshot
calculation_type
HOURLY/WORKDAY_MILESTONE/...
actual/eligible hours
Nếu VEN
actual/eligible workdays
Nếu CTV
rate/milestone_amount
Mức tại thời điểm tính
calculated_amount
Số tiền hệ thống tính
approved_amount
Số tiền cuối cùng nếu có điều chỉnh được phép
eligibility_date
Ngày đủ điều kiện
cutoff_date
Ngày chốt
payment_due_date
Ngày dự kiến thanh toán
status
Trạng thái transaction
XXII. APPROVAL 4 CẤP
Các giao dịch hoa hồng và tình huống tài chính được cấu hình yêu cầu phê duyệt phải đi đủ bốn cấp theo thứ tự sau:
Cấp
Role
Kết quả khi duyệt
1
LEAD
Chuyển Manager
2
MANAGER
Chuyển Kế toán
3
ACCOUNTING
Chuyển Giám đốc
4
DIRECTOR
APPROVED / đủ điều kiện thanh toán
Rule bắt buộcKhông phải “một trong bốn người duyệt”. Cả bốn cấp phải duyệt. Một cấp Reject → Transaction REJECTED và bắt buộc có lý do.
XXIII. APPROVAL MATRIX – XÁC ĐỊNH USER DUYỆT
Không hard-code tên cá nhân trong source code. Hệ thống xác định user duyệt theo Role + Scope + thời gian hiệu lực.
Field
Ý nghĩa
approval_matrix_id
PK
process_type
COMMISSION / PAYMENT_EXCEPTION / ...
company_id
Nếu cần theo công ty
office_id
Theo văn phòng
team_id
Theo team
approval_level
1–4
role_code
LEAD/MANAGER/ACCOUNTING/DIRECTOR
approver_user_id
User thực tế
effective_from/to
Thời gian hiệu lực
status
ACTIVE/INACTIVE
XXIV. LAO ĐỘNG NGHỈ SAU NGÀY CHỐT, TRƯỚC THANH TOÁN
Hệ thống trước hết kiểm tra rule của Policy cụ thể. Nếu Policy quy định rõ phải còn tại chức đến ngày thanh toán thì hệ thống đánh giá theo rule đó. Nếu hồ sơ thuộc trường hợp cần xét ngoại lệ/không đủ dữ liệu tự động, chuyển REVIEW_REQUIRED và đi qua quy trình Lead → Manager → Kế toán → Giám đốc.
Tình huống
Xử lý
Policy rõ điều kiện và dữ liệu đủ
Hệ thống tự xác định ELIGIBLE / NOT_ELIGIBLE theo Policy.
Có mâu thuẫn/ngoại lệ/cần xác nhận
REVIEW_REQUIRED → 4 cấp duyệt.
Một cấp Reject
REJECTED, lưu lý do và audit.
Giám đốc duyệt cuối
APPROVED FOR PAYMENT nếu các cấp trước đã duyệt.
XXV. WORKER REWARD – TÁCH KHỎI COMMISSION
Nguyên tắc tài chínhWorker Reward: Công ty/FCS → Người lao động. VEN/CTV Commission: Doanh nghiệp → VEN/CTV. Hai dòng tiền không dùng chung transaction.
Reward Policy được cấu hình theo Company, Campaign, Position, Office, đối tượng, thời gian áp dụng và milestone. Policy đã áp dụng không được ghi đè; thay đổi tạo version mới.
XXVI. COMPANY POLICY TEMPLATE – MẪU WNC
Mẫu WNC được dùng để xác định cấu trúc chuẩn cho một Company Policy: mỗi mốc có điều kiện, số tiền, nguồn chi và thời điểm/điều kiện thanh toán riêng.
Mã
Loại
Mốc/Điều kiện
Số tiền
Nguồn chi
Ghi chú
WNC-R01
Worker Reward
Đủ 1 tháng
2.000.000
WNC
Theo chính sách WNC
WNC-R02
Worker Reward
Đi làm đủ 7 ngày; trả khi đủ 10 ngày
500.000
FCS
Thanh toán thứ 5 hàng tuần theo mẫu
WNC-R03
Worker Reward
30 công, không cần chuyên cần, còn tại chức
1.000.000
FCS
Sau bảng công theo policy
WNC-R04
Worker Reward
Đủ 3 tháng
2.000.000
WNC
Theo chính sách WNC
WNC-R05
Worker Reward
60 công, không cần chuyên cần, còn tại chức
1.000.000
FCS
Sau bảng công theo policy
WNC-R06
Worker Reward
Đủ 6 tháng
2.000.000
WNC
Theo chính sách WNC
WNC-R07
Worker Reward
90 công, không cần chuyên cần, còn tại chức
1.000.000
FCS
Sau bảng công theo policy
WNC-R08
Worker Reward
120 ngày hành chính liên tiếp, chuyên cần
10.500.000
FCS
Theo điều kiện mẫu
WNC-REF
Referral Reward
30/60/90 ngày
1.000.000/mốc
FCS
Người giới thiệu còn tại chức và theo điều kiện mẫu
Lưu ýBảng WNC là mẫu cấu trúc chính sách của một công ty tại một thời kỳ, không phải mức thưởng chung cho toàn hệ thống.
XXVII. REWARD POLICY / MILESTONE
Bảng
Nội dung chính
reward_policy
policy_id, code, name, company_id, campaign_id, position_id, office_id, version, effective_from/to, status, source_document, approved_by/at
reward_policy_milestone
milestone_id, policy_id, milestone_code/name, calculation basis, required days/hours, attendance condition, amount, payer, payment rule
worker_reward
registration_id, policy/version snapshot, milestone, original_amount, approved_amount, eligibility_date, cutoff/payment dates, status
reward_payment
worker_reward_id, payment_method, amount, paid_at, bank/cash reference, status
XXVIII. POLICY VERSIONING & SNAPSHOT
Policy đang ACTIVE và đã phát sinh Registration/Transaction không được sửa ngược lịch sử.
Thay đổi mức/mốc/điều kiện → tạo Version mới với effective_from/effective_to mới.
Registration lưu Policy ID + Version áp dụng; Transaction lưu calculation snapshot.
Worker đã khóa Policy V1 không tự động chuyển sang V2 trừ khi có nghiệp vụ migrate/override được phê duyệt và audit.
XXIX. PHÂN QUYỀN VÀ DATA SCOPE
Role
Data Scope chuẩn
Sale
OWN_DATA / được phân công
Lead
TEAM_DATA
Manager
OFFICE/AREA_DATA
Hiện trường
Danh sách/phạm vi công ty hiện trường được giao
Kế toán
Financial scope được phân quyền
Giám đốc
All/management scope theo cấu hình
Admin
System administration
Permission nên quản lý theo User → Role → Permission → Data Scope, không hard-code điều kiện theo role trong từng màn hình.
XXX. AUDIT LOG
Nhóm
Bắt buộc audit
Worker
CCCD, merge, thông tin định danh
Recruitment
Đổi Sale, nguồn, công ty, status
Attribution
Thay VEN/CTV, yêu cầu attribution change
Policy
Tạo version, đổi rule/mức trước khi active, approve/reject
Commission/Reward
Tính, điều chỉnh, approve/reject, payment
Attendance
Import, xác nhận, chỉnh công/giờ
Audit tối thiểu: user_id, action, entity_type, entity_id, before_value, after_value, timestamp, reason, request/source reference.
XXXI. DASHBOARD / REPORT
Đối tượng
Chỉ số chính
Sale
Data được giao, đã gọi, chăm sóc, L2, L3, conversion.
Lead
Hiệu suất Sale, Data tồn, L2/L3, conversion theo team.
Manager
Theo Office, Company, Sale, Source, campaign.
Kế toán
Commission/Reward chờ duyệt, approved, paid, exception.
Giám đốc
Tổng Data, đi làm, hiệu quả tuyển dụng, chi phí reward/commission, policy đang áp dụng/chờ duyệt.
XXXII. BUSINESS RULES CHÍNH THỨC BA 1.5
Mã
Business Rule
BR-DATA-01
Một Worker chỉ có một Worker Profile.
BR-DATA-02
Một Worker có thể có nhiều Recruitment Registration.
BR-DATA-03
SĐT là khóa check trùng ban đầu; CCCD là định danh chính sau xác minh.
BR-DATA-04
Thông tin thay đổi theo thời gian không ghi đè trong Worker Profile nếu cần lịch sử.
BR-REG-01
Company/Sale/Source/Status thuộc Registration hoặc bảng nghiệp vụ liên quan.
BR-REF-01
Attribution gắn Registration; một Registration chỉ có 01 người hưởng referral commission tại cùng thời điểm theo policy.
BR-VEN-01
VEN mặc định hiện tại tính theo eligible hours × 12.000đ, tối đa 90 ngày; rate lấy từ Policy Version.
BR-CTV-01
CTV mặc định hiện tại 500.000đ/người/mốc 26 công, tối đa 90 ngày; milestone/repeat lấy từ Policy.
BR-COM-01
Commission phải snapshot policy/version và số liệu công/giờ.
BR-COM-02
Commission theo quy trình duyệt Lead → Manager → Kế toán → Giám đốc khi process yêu cầu 4 cấp.
BR-COM-03
Một cấp reject → REJECTED và bắt buộc lý do.
BR-REWARD-01
Worker Reward độc lập với VEN/CTV Commission.
BR-REWARD-02
Reward Policy theo Company/Period/Version/Milestone; không ghi đè policy cũ.
BR-POL-01
Mức tiền/mốc/điều kiện là configuration, không hard-code.
BR-APR-01
User duyệt resolve theo Approval Matrix + Role + Scope + effective period.
BR-AUD-01
Mọi thay đổi nghiệp vụ/tài chính trọng yếu phải Audit.
XXXIII. UAT BẮT BUỘC
Mã
Tình huống
Kết quả mong muốn
UAT-01
MKT nhập Data mới
Tạo C3 sau check trùng
UAT-02
2 Sale cùng nhận C3
Chỉ 1 Sale lock thành công
UAT-03
Sale tự tạo Data
Check trùng → tạo/ghép Worker đúng → Registration
UAT-04
Trùng SĐT
Không tạo Worker mới nếu xác minh là cùng người
UAT-05
Trùng CCCD
Cảnh báo/merge flow, giữ lịch sử
UAT-06
Ứng tuyển lần 2
Tạo Registration mới, không tạo Worker mới
UAT-07
Sale báo đỗ, Field báo khác
Giữ cả hai; Field confirmation là thực tế chính thức
UAT-08
L2.1 → L3
Field xác nhận ngày đi làm thực tế
UAT-09
VEN 200 giờ eligible
Commission = 200 × rate policy; với rate 12.000 → 2.400.000
UAT-10
VEN vượt 90 ngày
Không phát sinh ngoài benefit period trừ policy khác
UAT-11
CTV đạt 26 công
Tạo milestone 500.000 theo policy hiện hành
UAT-12
CTV chưa đủ 26 công
Chưa đủ điều kiện milestone
UAT-13
CTV vượt 90 ngày
Không phát sinh ngoài policy period
UAT-14
Policy đổi rate
Transaction cũ không đổi
UAT-15
Lead approve
Chuyển Manager
UAT-16
Manager approve
Chuyển Kế toán
UAT-17
Kế toán approve
Chuyển Giám đốc
UAT-18
Giám đốc approve
APPROVED/eligible payment
UAT-19
Một cấp reject
REJECTED + reason
UAT-20
Nghỉ sau cutoff trước payment
Áp policy; nếu exception → REVIEW_REQUIRED 4 cấp
UAT-21
Reward Policy WNC version mới
Registration cũ giữ version cũ
UAT-22
Đổi SĐT
Số cũ còn trong history và vẫn tìm được
UAT-23
Đổi Sale
Assignment history giữ đủ old/new
UAT-24
Thay attribution
Không cho Sale tự sửa trực tiếp; audit/approval theo permission
UAT-25
Attendance điều chỉnh sau xác nhận
Có version/audit; không âm thầm sửa transaction đã duyệt
XXXIV. ACCEPTANCE CRITERIA
Nhóm
Điều kiện nghiệm thu
Data/Worker
Không tạo trùng Worker; giữ lịch sử contact; merge có audit.
Recruitment
Đúng Registration, status master, permission, assignment history.
Interview/Field
Phân biệt Sale report và Field confirmation.
Employment/Attendance
Có ngày đi làm thực tế và dữ liệu công/giờ theo kỳ.
VEN/CTV
Attribution đúng Registration; policy/version đúng; giới hạn tối đa theo policy.
Commission
Tính đúng HOURLY/MILESTONE; snapshot; duyệt đúng luồng; payment traceable.
Reward
Company policy/milestone/version; không mất lịch sử; nguồn chi rõ.
Security/Audit
Role + scope; tất cả thay đổi trọng yếu có audit.
Reporting
Chỉ số đối soát được về transaction gốc.
XXXV. DATABASE LOGICAL MODEL – DANH SÁCH BẢNG
Domain
Bảng đề xuất
Master
company, position, office, team, province, ward, bank, education_level, relationship_type, data_source, recruitment_status, working_status
User & Access
user, role, permission, user_role, role_permission, approval_matrix
Worker
worker_profile, worker_phone, worker_address, worker_bank_account, worker_emergency_contact
Recruitment
recruitment_registration, registration_source, registration_assignment, consultation_history, interview, status_history
Employment
employment, attendance_period
Referral
referral_source, registration_attribution, attribution_change_request
Commission
commission_policy, commission_policy_rule/milestone, commission_transaction, commission_approval, commission_payment
Reward
reward_policy, reward_policy_milestone, worker_reward, worker_reward_milestone, reward_payment
Audit
audit_log
XXXVI. WORKFLOW TỔNG THỂ
Workflow chuẩn BA 1.5DATA → CHECK TRÙNG → WORKER PROFILE / RECRUITMENT REGISTRATION → ASSIGN SALE → L1 TƯ VẤN → L2 PHỎNG VẤN → FIELD CONFIRM → L3 ĐI LÀM → ATTENDANCETừ ATTENDANCE tách 2 nhánh tài chính:(A) WORKER REWARD → Reward Policy/Milestone → Payment(B) VEN/CTV COMMISSION → Commission Policy → Calculation → Lead → Manager → Kế toán → Giám đốc → Payment
XXXVII. CÁC ĐIỂM CÒN CẤU HÌNH, KHÔNG PHẢI OPEN LOGIC
Nhóm
Cách xử lý
Commission VEN
Rate thực tế theo từng thời kỳ/company/campaign; mặc định tham chiếu hiện tại 12.000đ/giờ.
Commission CTV
Amount/milestone/repeat thực tế; mặc định tham chiếu 500.000/26 công.
Benefit period
Mặc định tham chiếu hiện tại tối đa 90 ngày; policy có thể version.
Reward
Mức/mốc từng Company theo bảng chính sách thực tế.
Approval user
User thực tế của Lead/Manager/Accounting/Director trong Approval Matrix.
Payment method
Theo policy và cấu hình kế toán.
Attendance rule
Chuyên cần/nghỉ phép/nghỉ không lương theo từng policy.
XXXVIII. ĐIỀU KIỆN READY FOR DEV
Business Owner phê duyệt BA 1.5 và master status.
Permission Matrix / Data Scope được chốt.
ERD logical + physical mapping được review.
API/Functional Specification bám đúng Policy Versioning và Approval Matrix.
UAT cases được chuyển thành test cases có dữ liệu mẫu.
Master data ban đầu (Company, Office, Role, User approver, VEN/CTV...) được chuẩn bị.
Chính sách thực tế đầu tiên được nhập thử end-to-end để xác minh engine.
XXXIX. KẾT LUẬN BA 1.5
BA 1.5 chuẩn hóa hệ thống theo nguyên tắc dữ liệu lịch sử, policy-driven và transaction-driven. Worker Profile chỉ giữ dữ liệu cố định của người lao động; toàn bộ tuyển dụng, đi làm và tài chính được tách theo Registration/Employment/Policy/Transaction. Mức thưởng và hoa hồng không hard-code; mọi thay đổi chính sách tạo version mới. Luồng duyệt tài chính được xác định theo tài khoản Lead, Manager, Kế toán và Giám đốc thông qua Approval Matrix.
TRẠNG THÁI ĐỀ XUẤTBA 1.5 – READY FOR BUSINESS REVIEW. Sau khi Business Owner duyệt, chuyển sang Functional Specification + ERD/Database Design.
PHỤ LỤC A – DATA DICTIONARY TÓM TẮT
Domain
Key Entity
Quan hệ chính
Worker
worker_profile
1 Worker → N Registration
Contact
worker_phone/address/bank/emergency_contact
N record theo thời gian / Worker
Recruitment
recruitment_registration
N lần tuyển / Worker
Assignment
registration_assignment
N assignment / Registration
Interview
interview
N lần hẹn/xác nhận / Registration
Employment
employment
0..N employment / Registration tùy nghiệp vụ
Attendance
attendance_period
N kỳ công / Employment
Referral
registration_attribution
Attribution theo Registration
Commission
commission_transaction
N giao dịch theo policy/milestone/kỳ
Reward
worker_reward
N milestone theo reward policy
Approval
commission_approval / approval history
N bước theo transaction
Audit
audit_log
N event mọi domain
PHỤ LỤC B – QUY TẮC THIẾT KẾ DEV
Không lưu tên Company/Office/Bank/Status lặp lại nếu đã có master ID, nhưng snapshot text khi cần chứng từ/đối soát.
Không hard-delete entity nghiệp vụ đã phát sinh transaction; dùng status/archived/merged.
Không sửa trực tiếp transaction đã approved/paid; dùng adjustment/reversal flow có audit.
Tất cả bảng transaction có created_at/by, updated_at/by; bảng nhạy cảm có reason/source reference.
Datetime phải thống nhất timezone hệ thống; kỳ công và cutoff cần định nghĩa rõ ngày hiệu lực.
Các thao tác nhận Data, approve, payment phải chống xử lý đồng thời/double action.
PHỤ LỤC C – NGHIỆP VỤ CHẤM CÔNG TẠI NHÀ MÁY
Trạng thái: Đã chốt nghiệp vụ để đưa vào BA 1.5. Mục tiêu là xác nhận người lao động đã tới nhà máy bằng điện thoại cá nhân, GPS/Geofence và ảnh selfie tại thời điểm vào/ra; dữ liệu sau xác nhận được dùng làm đầu vào cho công, thưởng và hoa hồng.
C.1. Quyết định nghiệp vụ đã chốt
Nội dung
Quyết định
Thiết bị
Người lao động chỉ chấm công bằng điện thoại cá nhân đã đăng ký; không dùng chung thiết bị.
Điểm danh
Bắt buộc CHECK-IN khi tới nhà máy và CHECK-OUT khi rời nhà máy.
Mục tiêu định vị
Xác nhận đã tới đúng nhà máy/điểm chấm công; không theo dõi vị trí liên tục trong ca.
Bằng chứng
Mỗi CHECK-IN/CHECK-OUT bắt buộc lấy GPS mới, GPS Accuracy và chụp selfie trực tiếp.
Xác nhận công
Hiện trường xác nhận dữ liệu công; ngoại lệ chuyển Manager duyệt.
Tính tiền
Không dùng GPS raw để trả tiền. Chỉ confirmed_work_hours/confirmed_workdays được đưa sang Reward/Commission Engine.
C.2. Luồng nghiệp vụ tổng thể
WORKER LOGIN → kiểm tra EMPLOYMENT ACTIVE → xác định FACTORY + SHIFT → CHECK-IN (GPS + Accuracy + Device + Selfie) → làm việc → CHECK-OUT (GPS + Accuracy + Device + Selfie) → DAILY ATTENDANCE → HIỆN TRƯỜNG XÁC NHẬN → ngoại lệ MANAGER REVIEW → CONFIRMED ATTENDANCE → VEN / CTV / WORKER REWARD.
C.3. Điểm chấm công và Geofence
Mỗi Factory có một hoặc nhiều Attendance Location, ưu tiên cổng/điểm vào nhà máy.
Mỗi Location cấu hình latitude, longitude, radius_meter, max_accuracy_meter, thời gian hiệu lực và trạng thái.
Bán kính không hard-code cho toàn hệ thống; phải khảo sát thực tế từng nhà máy/cổng. Khi khuôn viên phức tạp có thể nâng cấp sang Polygon Geofence.
Mobile chỉ gửi tọa độ, accuracy, timestamp và device; Server tự tính khoảng cách và quyết định có nằm trong Geofence hay không.
C.4. Điều kiện CHECK-IN hợp lệ
#
Điều kiện
Xử lý
1
Đúng Worker/Tài khoản
Tài khoản phải liên kết worker_id hợp lệ.
2
Đúng thiết bị
Device phải ACTIVE và thuộc Worker; một Device không ACTIVE cho nhiều Worker.
3
Employment hợp lệ
Worker có Employment ACTIVE tại Factory tương ứng.
4
Đúng vị trí
Tọa độ nằm trong Geofence của Attendance Location được phép.
5
GPS đủ chính xác
gps_accuracy <= max_accuracy_meter của Location.
6
Đúng cửa sổ ca
Nằm trong check-in window của Shift hoặc bị đánh dấu ngoại lệ.
7
Có selfie
Bắt buộc chụp trực tiếp; không dùng ảnh Gallery nếu nền tảng kiểm soát được.
8
Không duplicate
Không tạo CHECK-IN hợp lệ trùng cho cùng Worker/Shift/Work Date.
C.5. Điều kiện CHECK-OUT hợp lệ
Có CHECK-IN trước đó thuộc đúng Worker/Shift.
Dùng đúng thiết bị cá nhân đã đăng ký.
Lấy GPS mới và kiểm tra lại Geofence + Accuracy.
Bắt buộc selfie mới tại thời điểm CHECK-OUT.
Ca qua ngày phải ghép CHECK-OUT ngày D+1 về đúng Shift của Work Date D.
Thiếu CHECK-OUT chuyển MISSING_CHECK_OUT; hệ thống không tự điền giờ kết thúc ca.
C.6. Ca làm việc
Work Shift phải là master/configuration theo Company/Factory. Hỗ trợ ca hành chính, ca ngày, ca đêm và ca qua ngày. Mỗi ca có start_time, end_time, crosses_midnight và các cửa sổ cho phép check-in/check-out. Đi muộn và về sớm được tính từ lịch ca, nhưng Presence Time không đồng nghĩa Paid Working Time.
C.7. Mô hình dữ liệu chấm công
Bảng
Mục đích
Trường chính
factory
Nhà máy thuộc Company
factory_id, company_id, code, name, address, status
attendance_location
Điểm/cổng chấm công
location_id, factory_id, latitude, longitude, radius_meter, max_accuracy_meter, status
work_shift
Danh mục ca
shift_id, company_id, start_time, end_time, crosses_midnight, check-in/out windows
worker_device
Thiết bị cá nhân
worker_id, device_id, os, app_version, registered_at, status
worker_shift_assignment
Phân ca theo Employment/ngày
employment_id, shift_id, work_date/effective period, status
attendance_event
Log CHECK-IN/CHECK-OUT bất biến
event_id, worker_id, employment_id, shift_id, location_id, event_type/time, GPS, accuracy, distance, device_id, selfie_id, status
daily_attendance
Tổng hợp ngày công
work_date, check-in/out event, presence, late, early leave, status, confirmed hours/days
attendance_adjustment_request
Yêu cầu điều chỉnh
attendance_id, requested values, reason, evidence, requester, approval status
C.8. Trạng thái chấm công
Master status đề xuất: NOT_CHECKED_IN, CHECKED_IN, CHECKED_OUT, PRESENT, LATE, EARLY_LEAVE, MISSING_CHECK_IN, MISSING_CHECK_OUT, OUTSIDE_GEOFENCE, INVALID_LOCATION, REVIEW_REQUIRED, CONFIRMED, REJECTED.
C.9. Xác nhận và điều chỉnh công
Attendance Event là log gốc và không được sửa trực tiếp. Sau khi tổng hợp Daily Attendance, Hiện trường đối chiếu dữ liệu App với ca, bảng công nhà máy, nghỉ/OT và dữ liệu thực tế. Trường hợp bình thường chuyển CONFIRMED. Trường hợp thiếu check-in/out, sai ca, GPS bất thường, chênh lệch bảng công hoặc yêu cầu sửa thời gian chuyển REVIEW_REQUIRED để Manager xử lý. Mọi điều chỉnh tạo Adjustment Record và Audit Log, không overwrite Event gốc.
C.10. Chống chấm công hộ và gian lận vị trí
1 Worker = 1 điện thoại cá nhân ACTIVE tại một thời điểm; đổi máy phải qua Device Change Request/xác minh.
Mỗi CHECK-IN/CHECK-OUT bắt buộc selfie và GPS mới.
Ghi Attempt Log khi chấm ngoài vùng hoặc GPS không đạt; không chỉ trả lỗi rồi bỏ dữ liệu.
Đánh dấu REVIEW_REQUIRED khi phát hiện mock location (nếu nền tảng hỗ trợ), timestamp cũ, tọa độ nhảy bất hợp lý, device không khớp hoặc dấu hiệu can thiệp.
Không coi phát hiện gian lận là tuyệt đối; giữ bằng chứng để Hiện trường/Manager review.
C.11. Quyền riêng tư
Hệ thống chỉ yêu cầu vị trí khi Worker chủ động CHECK-IN hoặc CHECK-OUT nhằm xác nhận đã tới nhà máy. Không thiết kế theo dõi vị trí liên tục trong ca. Quyền truy cập ảnh selfie, tọa độ và lịch sử chấm công phải theo RBAC/Data Scope và có Audit.
C.12. Liên kết với Reward và Commission
Đầu ra đã xác nhận
Nghiệp vụ sử dụng
Nguyên tắc
confirmed_work_hours
VEN Commission
Áp dụng Policy Version; baseline hiện tại 12.000đ × giờ đủ điều kiện, tối đa 90 ngày.
confirmed_workdays
CTV Commission
Áp dụng Policy Version; baseline hiện tại 500.000đ/người/mốc 26 công, tối đa 90 ngày.
confirmed_workdays/hours + điều kiện
Worker Reward
Đánh giá milestone theo Company Reward Policy; không dùng raw GPS trực tiếp.
C.13. Dashboard Hiện trường
Dashboard ngày cần hiển thị tối thiểu: tổng Worker dự kiến, đã/chưa Check-in, đi muộn, ngoài Geofence, GPS lỗi, đã/chưa Check-out, chờ xác nhận và chờ Manager xử lý. Bộ lọc: Company, Factory, Shift, Office, Sale, Team.
C.14. UAT bắt buộc
Mã
Kịch bản
Expected
ATT-01
Đúng Worker + đúng Device + đúng Factory + GPS tốt + Selfie
CHECK_IN_SUCCESS
ATT-02
Dùng điện thoại khác chưa đăng ký
Không cho chấm công; ghi lý do
ATT-03
Device đã ACTIVE cho Worker khác
Không cho đăng ký/chấm công
ATT-04
Ngoài Geofence
Reject + Attempt Log
ATT-05
GPS Accuracy không đạt
Không tạo Event hợp lệ; yêu cầu lấy lại vị trí
ATT-06
Không Selfie
Không hoàn thành Event
ATT-07
Check-in lặp
Không tạo duplicate
ATT-08
Có Check-in nhưng thiếu Check-out
MISSING_CHECK_OUT
ATT-09
Check-out không có Check-in
Không tạo Daily Attendance hợp lệ
ATT-10
Yêu cầu sửa giờ
Tạo Adjustment Request; giữ Event gốc
ATT-11
Hiện trường xác nhận dữ liệu bình thường
CONFIRMED
ATT-12
Có ngoại lệ
REVIEW_REQUIRED → Manager
ATT-13
VEN đủ giờ sau xác nhận
Commission dùng confirmed_work_hours
ATT-14
CTV đủ mốc công sau xác nhận
Commission dùng confirmed_workdays
ATT-15
Ca qua ngày
Ghép CHECK-IN D và CHECK-OUT D+1 đúng Work Date/Shift
C.15. Phạm vi triển khai kỹ thuật đề xuất
Phase 1: App cá nhân, Login, Device Binding, GPS/Accuracy, Geofence, Selfie, Check-in/out, Shift, Daily Attendance, Dashboard Hiện trường, Adjustment, Confirmation và Audit. Phase 2: Dynamic QR/Bluetooth Beacon nếu cần, Polygon Geofence, Fraud Scoring nâng cao, đối soát tự động bảng công nhà máy và Device Attestation/Mock-location detection nâng cao.
C.16. Điều kiện sẵn sàng phát triển module Attendance
Khảo sát và chốt tọa độ/bán kính thực tế của ít nhất 01 Factory pilot.
Chốt danh mục Shift và cửa sổ chấm công của Factory pilot.
Chốt quy trình đăng ký/đổi thiết bị cá nhân.
Chốt người dùng thuộc vai trò Hiện trường và Manager cho pilot.
Chốt nguồn bảng công nhà máy để đối soát.
Chốt thời gian lưu ảnh selfie/GPS theo quy định nội bộ và yêu cầu pháp lý áp dụng.
Chạy pilot 20–50 Worker song song với bảng công hiện tại trước khi dùng dữ liệu để tính tiền tự động.
Kết luận: Attendance là lớp bằng chứng hiện diện. Dữ liệu tài chính chỉ sử dụng công/giờ sau khi được xác nhận. Kiến trúc này cho phép triển khai độc lập trước, sau đó nối trực tiếp vào Worker/Employment/Reward/Commission của CRM BA 1.5.