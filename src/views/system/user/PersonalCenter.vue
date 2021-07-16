<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane :label="activeNames[0].label" :name="activeNames[0].name">
        <el-form ref="form" :rules="rules" :model="formData" label-width="120px">
          <el-row class="personal-center" :gutter="20" type="flex" justify="center" align="middle">
            <el-col :span="4">
              <el-row class="avatar-container">
                <el-avatar :key="formData.avatar" shape="circle" :size="100" fit="fill" :src="imagePath" />
              </el-row>
              <el-row class="avatar-container">
                <el-radio-group v-model="formData.sex">
                  <el-radio
                    v-for="(item, index) in getDict('sys_sex')"
                    :key="'sx'+index"
                    :label="item.dictValue"
                  >
                    {{ item.dictLabel }}
                  </el-radio>
                </el-radio-group>
              </el-row>
              <el-row class="avatar-container">
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  :multiple="true"
                  :auto-upload="false"
                  :action="uploadurl"
                  :on-change="handleChange"
                  :file-list="fileList"
                  :show-file-list="false"
                  :on-success="imageUrl"
                  accept=".jpg,.jpeg,.png,.gif,.JPG,.JPEG,.PBG,.GIF"
                >
                  <el-button type="primary">修改头像</el-button>
                  <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
                </el-upload>
              </el-row>

            </el-col>
            <el-col :span="12">
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="用户昵称" prop="userName">
                    <el-input v-model="formData.userName" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="电子邮箱" prop="email">
                    <el-input v-model="formData.email" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="formData.mobile" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="办公电话" prop="phone">
                    <el-input v-model="formData.phone" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="个性签名">
                    <el-input
                      v-model="formData.sign"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item>
                    <el-button type="primary" :loading="baseInfoLoading" @click="saveBaseInfo">保存</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="activeNames[1].label" :name="activeNames[1].name">
        <el-row class="personal-center">
          <el-col :span="12">
            <el-form ref="passwordForm" :rules="pwdRules" :model="pwdformData" label-width="120px">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="旧密码" prop="password">
                    <el-input v-model="pwdformData.password" type="password" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="pwdformData.newPassword" type="password" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="pwdformData.confirmPassword" type="password" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item>
                    <el-button type="primary" :loading="updatePasswordLoading" @click="updatePassword">确认修改</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import md5 from 'js-md5'
import { getUserDetail, saveUser, updatePassword } from '@/api/system/user'
import { mapGetters, mapActions } from 'vuex'
import store from '@/store'

export default {
  name: 'PersonalCenter',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    const confirmValidatePassword = (rule, value, callback) => {
      if (value !== this.pwdformData.newPassword) {
        callback(new Error('和新密码不一致'))
      } else {
        callback()
      }
    }
    return {
      imagePath: '',
      uploadurl: '',
      fileList: [],
      baseInfoLoading: false,
      updatePasswordLoading: false,
      formData: {
        id: '',
        userName: '',
        mobile: '',
        phone: '',
        sign: '',
        sex: '',
        email: '',
        avatar: ''
      },
      pwdformData: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      },
      activeNames: [
        {
          name: '1',
          label: '基本信息'
        },
        {
          name: '2',
          label: '修改密码'
        }
      ],
      activeName: '1',
      pwdRules: {
        password: [
          { required: true, message: '请输入旧密码', trigger: 'blur', validator: validatePassword },
          { min: 6, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur', validator: validatePassword },
          { min: 6, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur', validator: confirmValidatePassword },
          { validator: confirmValidatePassword },
          { min: 6, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      rules: {
        userName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        mobile: [
          { pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/, message: '请输入合法的手机号', trigger: 'blur' }
        ],
        email: [
          { pattern: /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g, message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^\d{3}-\d{7,8}|\d{4}-\d{7,8}$/, message: '请输入合法的电话号', trigger: 'blur' }
        ],
        sign: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict'])
  },
  mounted() {
    const userInfo = this.$store.getters['user/getCurUser']
    this.getDetailData(userInfo.id)
  },
  methods: {
    ...mapActions('user', ['setAvatar']),
    handleChange(file, fileList) {
      var _this = this
      this.fileList = [file]
      this.uploadurl = process.env.VUE_APP_BASE_URL + '/htSysUser/upload'
      var reader = new FileReader()
      reader.onload = function(e) {
        _this.imagePath = e.target.result
      }
      reader.readAsDataURL(file.raw)
    },
    imageUrl(res, file, fileList) {
      this.formData.avatar = res.msg
      this.formSubmit(res.msg)
    },
    saveBaseInfo() {
      if (this.fileList.length > 0) {
        this.$refs.upload.headers['Authorization'] = store.getters.token
        this.$refs.upload.submit()
        this.fileList.length = []
      } else {
        this.formSubmit()
      }
    },
    formSubmit(msg) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.baseInfoLoading = true
          saveUser(this.formData).then(res => {
            this.$message({
              type: 'success',
              message: '保存成功'
            })
            if (msg) {
              this.setAvatar(msg)
            }
            this.getDetailData(this.formData.id)
          }).finally(() => {
            this.baseInfoLoading = false
          })
        }
      })
    },
    updateAvatar() {

    },
    updatePassword() {
      console.log()
      this.$refs['passwordForm'].validate((valid) => {
        if (valid) {
          if (this.$store.state.user.user.password === md5(this.pwdformData.password)) {
            this.updatePasswordLoading = true
            updatePassword({ id: this.formData.id, encodePassword: md5(this.pwdformData.newPassword) }).then(res => {
              this.$message({
                type: 'success',
                message: '密码修改成功'
              })
              this.$store.state.user.user.password = md5(this.pwdformData.newPassword)
            }).finally(() => {
              this.updatePasswordLoading = false
            })
          } else {
            this.$message({
              type: 'error',
              message: '旧密码错误'
            })
          }
        }
      })
    },
    getDetailData(id) {
      this.resetForm()
      getUserDetail({ id: id }).then(res => {
        this.formData = res.data
        if (res.data.avatar === null) {
          this.imagePath = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
        } else if (res.data.avatar.substring(0, 4) !== 'http') {
          this.imagePath = process.env.VUE_APP_BASE_URL + this.formData.avatar
        }
      }).finally(() => {
      })
    },
    resetForm() {
      this.formData = {
        id: '',
        userName: '',
        mobile: '',
        phone: '',
        sign: '',
        sex: '',
        email: ''
      }
      this.pwdformData = {
        password: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.personal-center{
  padding: 10px;
}
.avatar-container{
  padding: 10px;
}
</style>
